export function accountCreatedTemplate(params: {
  agencyName: string;
  dashboardUrl: string;
  tempPassword: string;
}) {
  const subject = `🎉 Votre compte agence a été créé avec succès`;
  const html = `
<p>Bonjour <b>${params.agencyName}</b>,</p>
<p>Votre compte a été créé avec succès. Vous pouvez dès à présent accéder à votre tableau de bord en utilisant les informations ci-dessous :</p>
<p>🔗 <b>Lien d’accès :</b> <a href="${params.dashboardUrl}" target="_blank" rel="noopener noreferrer">${params.dashboardUrl}</a><br/>
🔑 <b>Mot de passe temporaire :</b> <code>${params.tempPassword}</code></p>
<p>⚠️ <b>Important :</b> Pour des raisons de sécurité, nous vous invitons à modifier ce mot de passe dès votre première connexion.</p>
<p>Nous vous souhaitons une excellente utilisation de la plateforme.</p>
<p>Cordialement,<br/>L’équipe Support</p>`;
  return { subject, html };
}

export function passwordResetTemplate(params: { resetUrl: string }) {
  const subject = `🔐 Réinitialisation de votre mot de passe`;
  const html = `
<p>Bonjour,</p>
<p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous:</p>
<p><a href="${params.resetUrl}" target="_blank" rel="noopener noreferrer">Réinitialiser mon mot de passe</a></p>
<p>Ce lien expirera dans 1 heure.</p>
<p>Cordialement,<br/>L’équipe Support</p>`;
  return { subject, html };
}
