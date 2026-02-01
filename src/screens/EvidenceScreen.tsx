// Evidence Screen - Display scientific research for an ingredient
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

interface Props {
  ingredient: string;
  onClose: () => void;
}

export default function EvidenceScreen({ ingredient, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState<IngredientResearch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadResearch();
  }, [ingredient]);

  const loadResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await researchIngredient(ingredient);
      setResearch(result);
    } catch (err) {
      setError('Failed to load research. Please try again.');
      console.error('Research error:', err);
    }
    setLoading(false);
  };

  const filteredEvidence = research?.evidence.filter(e => 
    selectedType === 'all' || e.type === selectedType
  ) || [];

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case 'safe': return '#4CAF50';
      case 'generally_safe': return '#8BC34A';
      case 'caution': return '#FF9800';
      case 'avoid': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getSafetyLabel = (rating: string) => {
    switch (rating) {
      case 'safe': return '✅ Safe';
      case 'generally_safe': return '👍 Generally Safe';
      case 'caution': return '⚠️ Use Caution';
      case 'avoid': return '🚫 Avoid';
      default: return '❓ Unknown';
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

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': return { label: 'High', color: '#4CAF50' };
      case 'medium': return { label: 'Medium', color: '#FF9800' };
      default: return { label: 'Low', color: '#9E9E9E' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>🔬 Researching {ingredient}...</Text>
        <Text style={styles.loadingSubtext}>
          Searching PubMed, Semantic Scholar, and regulatory databases
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Research</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ingredient Title */}
        <Text style={styles.ingredientName}>{ingredient}</Text>
        
        {/* Summary Card */}
        {research?.summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={[
                styles.safetyBadge,
                { backgroundColor: getSafetyColor(research.summary.safetyRating) }
              ]}>
                <Text style={styles.safetyText}>
                  {getSafetyLabel(research.summary.safetyRating)}
                </Text>
              </View>
              <Text style={styles.studyCount}>
                {research.summary.totalStudies} studies found
              </Text>
            </View>

            {research.summary.regulatoryStatus.length > 0 && (
              <View style={styles.regulatoryRow}>
                <Text style={styles.regulatoryLabel}>Reviewed by:</Text>
                {research.summary.regulatoryStatus.map((status, idx) => (
                  <View key={idx} style={styles.regulatoryTag}>
                    <Text style={styles.regulatoryTagText}>{status}</Text>
                  </View>
                ))}
              </View>
            )}

            {research.summary.keyFindings.length > 0 && (
              <View style={styles.findingsSection}>
                <Text style={styles.findingsTitle}>Key Findings:</Text>
                {research.summary.keyFindings.map((finding, idx) => (
                  <Text key={idx} style={styles.findingText}>• {finding}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {['all', 'pubmed', 'semantic_scholar', 'regulatory', 'web'].map(type => (
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
                 type === 'semantic_scholar' ? '📚 Papers' :
                 type === 'regulatory' ? '🏛️ Regulatory' : '🌐 Web'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Evidence List */}
        <View style={styles.evidenceList}>
          {filteredEvidence.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No evidence found for this filter</Text>
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
                  <View style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceBadge(item.confidence).color }
                  ]}>
                    <Text style={styles.confidenceText}>
                      {getConfidenceBadge(item.confidence).label}
                    </Text>
                  </View>
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

                {item.tags.length > 0 && (
                  <View style={styles.tagContainer}>
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

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
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  safetyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  studyCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#757575',
  },
  regulatoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  regulatoryLabel: {
    fontSize: 13,
    color: '#616161',
    marginRight: 8,
  },
  regulatoryTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  regulatoryTagText: {
    fontSize: 12,
    color: '#1565C0',
    fontWeight: '500',
  },
  findingsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  findingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  findingText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 4,
  },
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
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#757575',
  },
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
