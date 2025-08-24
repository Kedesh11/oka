import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/server/db/prisma'

function generateDateRange(days: number): string[] {
  const today = new Date()
  const arr: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(today.getDate() - i)
    arr.push(d.toISOString().slice(0, 10))
  }
  return arr
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const agenceId = (session?.user as any)?.agenceId as number | null
    if (!agenceId) {
      return NextResponse.json({ error: 'Agence non authentifiée' }, { status: 401 })
    }

    const dates = generateDateRange(30)
    const start = new Date(dates[0] + 'T00:00:00.000Z')
    const end = new Date(dates[dates.length - 1] + 'T23:59:59.999Z')

    // Récupère toutes les réservations et voyages dans l'intervalle pour cette agence
    const [reservationsRows, voyagesRows, confirmedReservationRows] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          trajet: { agenceId },
        },
        select: { createdAt: true },
      }),
      prisma.voyage.findMany({
        where: {
          date: { gte: start, lte: end },
          trajet: { agenceId },
        },
        select: { date: true },
      }),
      prisma.reservation.findMany({
        where: {
          statut: 'confirmee',
          createdAt: { gte: start, lte: end },
          trajet: { agenceId },
        },
        include: { trajet: true },
      }),
    ])

    // Index par date ISO (YYYY-MM-DD)
    const resByDate = new Map<string, number>()
    const voyByDate = new Map<string, number>()
    const revByDate = new Map<string, number>()

    for (const r of reservationsRows) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10)
      resByDate.set(key, (resByDate.get(key) || 0) + 1)
    }

    for (const v of voyagesRows) {
      const key = new Date(v.date).toISOString().slice(0, 10)
      voyByDate.set(key, (voyByDate.get(key) || 0) + 1)
    }

    for (const r of confirmedReservationRows) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10)
      const adults = Math.max((r.nbVoyageurs || 0) - (r.childrenCount || 0), 0)
      const children = r.childrenCount || 0
      const adultPrice = r.trajet?.prixAdulte || 0
      const childPrice = r.trajet?.prixEnfant || 0
      const amount = adults * adultPrice + children * childPrice
      revByDate.set(key, (revByDate.get(key) || 0) + amount)
    }

    const reservations = dates.map(d => resByDate.get(d) || 0)
    const activeVoyages = dates.map(d => voyByDate.get(d) || 0)
    const revenue = dates.map(d => revByDate.get(d) || 0)

    return NextResponse.json({ dates, reservations, activeVoyages, revenue })
  } catch (e) {
    console.error('[trends] error:', e)
    return NextResponse.json({ error: 'Erreur lors du chargement des tendances' }, { status: 500 })
  }
}
