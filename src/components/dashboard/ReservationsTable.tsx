import { Table, Card, Tag } from 'antd';

export function ReservationsTable() {
  // Placeholder table for recent reservations
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    trajet: "Trajet "+(i+1),
    client: "Client "+(i+1),
    statut: "en_attente",
  }));
  
  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Trajet',
      dataIndex: 'trajet',
      key: 'trajet',
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: string) => (
        <Tag color="orange">{statut}</Tag>
      ),
    },
  ];

  return (
    <Card title="Réservations récentes" size="small">
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        pagination={{
          pageSize: 4,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: false,
        }}
        size="small"
      />
    </Card>
  );
}
