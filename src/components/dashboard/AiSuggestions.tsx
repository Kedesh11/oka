"use client";

import React, { useState } from 'react';
import { Card, List, Button, Tag, Typography, Space, Avatar, Progress, Alert } from 'antd';
import { 
  BulbOutlined, 
  RiseOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CarOutlined
} from '@ant-design/icons';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Route,
  Zap
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

interface Suggestion {
  id: string;
  type: 'optimization' | 'alert' | 'opportunity' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'revenue' | 'efficiency' | 'customer' | 'operational';
  status: 'pending' | 'implemented' | 'dismissed';
  estimatedValue?: string;
  implementationTime?: string;
  createdAt: string;
}

export const AiSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'optimization',
      title: 'Optimiser les prix sur la route Libreville-Port-Gentil',
      description: 'L\'analyse des données montre que cette route a un taux de remplissage de 95%. Une augmentation de 5% des prix pourrait générer 150,000 FCFA supplémentaires par mois.',
      priority: 'high',
      impact: 'revenue',
      status: 'pending',
      estimatedValue: '+150,000 FCFA/mois',
      implementationTime: '1 jour',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Taux de ponctualité en baisse',
      description: 'Le taux de ponctualité est passé de 85% à 72% ce mois. Recommandation: analyser les causes et mettre en place des mesures correctives.',
      priority: 'high',
      impact: 'customer',
      status: 'pending',
      implementationTime: '1 semaine',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Nouvelle route potentielle: Libreville-Oyem',
      description: 'Analyse de la demande: 45 demandes non satisfaites ce mois. Créer cette route pourrait générer 200,000 FCFA/mois.',
      priority: 'medium',
      impact: 'revenue',
      status: 'pending',
      estimatedValue: '+200,000 FCFA/mois',
      implementationTime: '2 semaines',
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      type: 'insight',
      title: 'Pic de réservations le vendredi',
      description: 'Les réservations augmentent de 40% le vendredi. Considérer des départs supplémentaires ce jour-là.',
      priority: 'medium',
      impact: 'efficiency',
      status: 'pending',
      estimatedValue: '+80,000 FCFA/mois',
      implementationTime: '3 jours',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      type: 'optimization',
      title: 'Réduire les coûts opérationnels',
      description: 'L\'analyse des dépenses montre que 15% des coûts peuvent être optimisés sans impact sur la qualité de service.',
      priority: 'medium',
      impact: 'efficiency',
      status: 'pending',
      estimatedValue: '-120,000 FCFA/mois',
      implementationTime: '1 mois',
      createdAt: '2024-01-11'
    }
  ]);

  const getTypeIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'optimization':
        return <RiseOutlined className="text-green-600" />;
      case 'alert':
        return <WarningOutlined className="text-red-600" />;
      case 'opportunity':
        return <BulbOutlined className="text-green-600" />;
      case 'insight':
        return <CheckCircleOutlined className="text-purple-600" />;
      default:
        return <BulbOutlined />;
    }
  };

  const getTypeColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'optimization':
        return 'green';
      case 'alert':
        return 'red';
      case 'opportunity':
        return 'green';
      case 'insight':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getImpactIcon = (impact: Suggestion['impact']) => {
    switch (impact) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'efficiency':
        return <Zap className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'operational':
        return <Route className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleImplement = (id: Suggestion['id']) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: 'implemented' } : s)
    );
  };

  const handleDismiss = (id: Suggestion['id']) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: 'dismissed' } : s)
    );
  };

  const activeSuggestions = suggestions.filter(s => s.status === 'pending');
  const implementedSuggestions = suggestions.filter(s => s.status === 'implemented');

  const totalValue = activeSuggestions.reduce((sum, s) => {
    if (s.estimatedValue && s.estimatedValue.includes('+')) {
      const value = parseInt(s.estimatedValue.replace(/[^\d]/g, ''));
      return sum + value;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <Title level={3}>Suggestions IA</Title>
          <Text type="secondary">Recommandations intelligentes pour optimiser votre activité</Text>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeSuggestions.length}</div>
            <Text type="secondary" className="text-sm">Suggestions actives</Text>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()}</div>
            <Text type="secondary" className="text-sm">FCFA potentiels</Text>
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      {activeSuggestions.filter(s => s.priority === 'high').length > 0 && (
        <Alert
          message="Suggestions prioritaires"
          description={`${activeSuggestions.filter(s => s.priority === 'high').length} suggestions nécessitent votre attention immédiate.`}
          type="warning"
          showIcon
          action={
            <Button size="small" type="link">
              Voir toutes
            </Button>
          }
        />
      )}

      {/* Suggestions actives */}
      <Card title="Suggestions Actives" extra={<Button type="link">Voir toutes</Button>}>
        <List
          dataSource={activeSuggestions}
          renderItem={(suggestion) => (
            <List.Item
              actions={[
                <Button 
                  key="implement" 
                  type="primary" 
                  size="small"
                  onClick={() => handleImplement(suggestion.id)}
                >
                  Implémenter
                </Button>,
                <Button 
                  key="dismiss" 
                  size="small"
                  onClick={() => handleDismiss(suggestion.id)}
                >
                  Ignorer
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={getTypeIcon(suggestion.type)}
                    className="bg-transparent"
                  />
                }
                title={
                  <div className="flex items-center gap-2">
                    <span>{suggestion.title}</span>
                    <Tag color={getTypeColor(suggestion.type)}>
                      {suggestion.type.toUpperCase()}
                    </Tag>
                    <Tag color={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority.toUpperCase()}
                    </Tag>
                  </div>
                }
                description={
                  <div className="space-y-2">
                    <Paragraph className="mb-2">{suggestion.description}</Paragraph>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {suggestion.estimatedValue && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{suggestion.estimatedValue}</span>
                        </div>
                      )}
                      {suggestion.implementationTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{suggestion.implementationTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {getImpactIcon(suggestion.impact)}
                        <span>{suggestion.impact}</span>
                      </div>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Suggestions implémentées */}
      {implementedSuggestions.length > 0 && (
        <Card title="Suggestions Implémentées" extra={<Button type="link">Voir toutes</Button>}>
          <List
            dataSource={implementedSuggestions}
            renderItem={(suggestion) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                                      <Avatar 
                    icon={<CheckCircleOutlined className="text-green-600" />}
                    className="bg-transparent"
                  />
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span>{suggestion.title}</span>
                      <Tag color="green">IMPLÉMENTÉ</Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <Paragraph className="mb-2">{suggestion.description}</Paragraph>
                      {suggestion.estimatedValue && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>Valeur estimée: {suggestion.estimatedValue}</span>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Résumé des impacts */}
      <Card title="Impact des Suggestions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {activeSuggestions.filter(s => s.impact === 'revenue').length}
            </div>
            <Text type="secondary">Impact Revenus</Text>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {activeSuggestions.filter(s => s.impact === 'efficiency').length}
            </div>
            <Text type="secondary">Impact Efficacité</Text>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {activeSuggestions.filter(s => s.impact === 'customer').length}
            </div>
            <Text type="secondary">Impact Client</Text>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {implementedSuggestions.length}
            </div>
            <Text type="secondary">Implémentées</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AiSuggestions;
