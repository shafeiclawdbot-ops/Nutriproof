// Evidence Screen - Display AI-synthesized recommendations + scientific research
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { researchIngredient, IngredientResearch, EvidenceItem } from '../services/researchPipeline';
import { synthesizeResearch, AIRecommendation } from '../services/aiSynthesisService';

interface Props {
  ingredient: string;
  onClose: () => void;
}

export default function EvidenceScreen({ ingredient, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [research, setResearch] = useState<IngredientResearch | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    loadResearch();
  }, [ingredient]);

  const loadResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Gather research
      const result = await researchIngredient(ingredient);
      setResearch(result);
      setLoading(false);

      // Step 2: AI synthesis
      setSynthesizing(true);
      if (result.aggregated) {
        const recommendation = await synthesizeResearch(ingredient, result.aggregated);
        setAiRecommendation(recommendation);
      }
      setSynthesizing(false);
    } catch (err) {
      setError('Failed to load research. Please try again.');
      console.error('Research error:', err);
      setLoading(false);
      setSynthesizing(false);
    }
  };

  const filteredEvidence = research?.evidence.filter(e => 
    selectedType === 'all' || e.type === selectedType
  ) || [];

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return '#4CAF50';
      case 'generally_safe': return '#8BC34A';
      case 'caution': return '#FF9800';
      case 'avoid': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'safe': return '✅';
      case 'generally_safe': return '👍';
      case 'caution': return '⚠️';
      case 'avoid': return '🚫';
      default: return '❓';
    }
  };

  const getSafetyLabel = (level: string) => {
    switch (level) {
      case 'safe': return 'Safe';
      case 'generally_safe': return 'Generally Safe';
      case 'caution': return 'Use Caution';
      case 'avoid': return 'Avoid';
      case 'insufficient_data': return 'More Research Needed';
      default: return 'Unknown';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return { text: 'High Confidence', color: '#4CAF50' };
      case 'medium': return { text: 'Moderate Confidence', color: '#FF9800' };
      default: return { text: 'Limited Evidence', color: '#9E9E9E' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pubmed': return '🔬';
      case 'semantic_scholar': return '📚';
      case 'regulatory': return '🏛️';
      case 'web': return '🌐';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>🔬 Researching {ingredient}...</Text>
        <Text style={styles.loadingSubtext}>
          Searching PubMed, Semantic Scholar & web sources
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadResearch}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const confidenceInfo = aiRecommendation ? getConfidenceLabel(aiRecommendation.confidence) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ingredient Title */}
        <Text style={styles.ingredientName}>{ingredient}</Text>
        
        {/* AI Recommendation Card */}
        {synthesizing ? (
          <View style={styles.aiCard}>
            <View style={styles.aiCardLoading}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.aiCardLoadingText}>🧠 AI analyzing evidence...</Text>
            </View>
          </View>
        ) : aiRecommendation ? (
          <View style={styles.aiCard}>
            {/* Safety Badge */}
            <View style={styles.aiHeader}>
              <View style={[
                styles.safetyBadgeLarge,
                { backgroundColor: getSafetyColor(aiRecommendation.safetyLevel) }
              ]}>
                <Text style={styles.safetyIcon}>
                  {getSafetyIcon(aiRecommendation.safetyLevel)}
                </Text>
                <Text style={styles.safetyLabelLarge}>
                  {getSafetyLabel(aiRecommendation.safetyLevel)}
                </Text>
              </View>
              {confidenceInfo && (
                <View style={[styles.confidenceBadge, { backgroundColor: confidenceInfo.color }]}>
                  <Text style={styles.confidenceText}>{confidenceInfo.text}</Text>
                </View>
              )}
            </View>

            {/* Summary */}
            <Text style={styles.aiSummary}>{aiRecommendation.summary}</Text>

            {/* Key Points */}
            {aiRecommendation.keyPoints.length > 0 && (
              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>📋 Key Findings</Text>
                {aiRecommendation.keyPoints.map((point, idx) => (
                  <Text key={idx} style={styles.aiBullet}>• {point}</Text>
                ))}
              </View>
            )}

            {/* Benefits */}
            {aiRecommendation.benefits.length > 0 && (
              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>✨ Potential Benefits</Text>
                {aiRecommendation.benefits.map((benefit, idx) => (
                  <Text key={idx} style={styles.aiBulletGreen}>• {benefit}</Text>
                ))}
              </View>
            )}

            {/* Concerns */}
            {aiRecommendation.concerns.length > 0 && (
              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>⚠️ Considerations</Text>
                {aiRecommendation.concerns.map((concern, idx) => (
                  <Text key={idx} style={styles.aiBulletOrange}>• {concern}</Text>
                ))}
              </View>
            )}

            {/* Recommendation */}
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>🎯 Recommendation</Text>
              <Text style={styles.recommendationText}>{aiRecommendation.recommendation}</Text>
            </View>

            {/* Citations */}
            {aiRecommendation.citations.length > 0 && (
              <View style={styles.citationsRow}>
                <Text style={styles.citationsLabel}>
                  Based on {aiRecommendation.citations.length} sources
                </Text>
                <TouchableOpacity onPress={() => setShowSources(!showSources)}>
                  <Text style={styles.citationsToggle}>
                    {showSources ? 'Hide' : 'Show'} citations
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {showSources && aiRecommendation.citations.length > 0 && (
              <View style={styles.citationsList}>
                {aiRecommendation.citations.map((citation, idx) => (
                  <TouchableOpacity 
                    key={idx}
                    onPress={() => {
                      const url = citation.startsWith('PMID:')
                        ? `https://pubmed.ncbi.nlm.nih.gov/${citation.replace('PMID:', '')}`
                        : citation.startsWith('DOI:')
                        ? `https://doi.org/${citation.replace('DOI:', '')}`
                        : null;
                      if (url) openLink(url);
                    }}
                  >
                    <Text style={styles.citationItem}>{citation}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* Show Raw Papers Toggle */}
        <TouchableOpacity 
          style={styles.sourcesToggle}
          onPress={() => setShowSources(!showSources)}
        >
          <Text style={styles.sourcesToggleText}>
            📚 View {research?.evidence.length || 0} Scientific Papers
          </Text>
        </TouchableOpacity>

        {/* Filter Tabs (when showing papers) */}
        {showSources && (
          <>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {['all', 'pubmed', 'semantic_scholar', 'web'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterTab,
                    selectedType === type && styles.filterTabActive
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[
                    styles.filterTabText,
                    selectedType === type && styles.filterTabTextActive
                  ]}>
                    {type === 'all' ? '📋 All' : 
                     type === 'pubmed' ? '🔬 PubMed' :
                     type === 'semantic_scholar' ? '📚 Papers' : '🌐 Web'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Evidence List */}
            <View style={styles.evidenceList}>
              {filteredEvidence.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No papers found for this filter</Text>
                </View>
              ) : (
                filteredEvidence.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.evidenceCard}
                    onPress={() => openLink(item.url)}
                  >
                    <View style={styles.evidenceHeader}>
                      <Text style={styles.evidenceIcon}>{getTypeIcon(item.type)}</Text>
                      <Text style={styles.evidenceSource}>{item.source}</Text>
                      {item.year && (
                        <Text style={styles.evidenceYear}>{item.year}</Text>
                      )}
                    </View>
                    
                    <Text style={styles.evidenceTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    
                    <Text style={styles.evidenceSummary} numberOfLines={3}>
                      {item.summary}
                    </Text>

                    {item.citations !== undefined && item.citations > 0 && (
                      <Text style={styles.citationCount}>
                        📖 {item.citations} citations
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This information is for educational purposes only and should not 
            replace professional medical advice. Always consult healthcare 
            providers for health decisions.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
  },
  scroll: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  // AI Card Styles
  aiCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  aiCardLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  aiCardLoadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  safetyBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  safetyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  safetyLabelLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  aiSummary: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
    lineHeight: 24,
    marginBottom: 16,
  },
  aiSection: {
    marginBottom: 16,
  },
  aiSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 8,
  },
  aiBullet: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 22,
    paddingLeft: 4,
  },
  aiBulletGreen: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 22,
    paddingLeft: 4,
  },
  aiBulletOrange: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 22,
    paddingLeft: 4,
  },
  recommendationBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 22,
  },
  citationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  citationsLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  citationsToggle: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  citationsList: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  citationItem: {
    fontSize: 11,
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  // Sources Toggle
  sourcesToggle: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sourcesToggleText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Filter Tabs
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    fontSize: 14,
    color: '#616161',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  // Evidence List
  evidenceList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  evidenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  evidenceSource: {
    fontSize: 12,
    color: '#757575',
    flex: 1,
  },
  evidenceYear: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  evidenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
    lineHeight: 20,
  },
  evidenceSummary: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 18,
  },
  citationCount: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 8,
  },
  // Disclaimer
  disclaimer: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#F57F17',
    lineHeight: 18,
  },
});
