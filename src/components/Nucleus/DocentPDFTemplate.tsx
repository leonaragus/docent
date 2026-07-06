import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Font registration (optional, but good for branding)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

Font.register({
  family: 'Roboto-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf'
});

interface DocentPDFTemplateProps {
  header: string;
  authors: string;
  content: string;
  brandColor?: string;
}

export const DocentPDFTemplate: React.FC<DocentPDFTemplateProps> = ({ header, authors, content, brandColor = '#4f46e5' }) => {
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Roboto',
      backgroundColor: '#ffffff'
    },
    headerBox: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: brandColor,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Roboto-Bold',
      color: brandColor,
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 12,
      color: '#666666',
    },
    contentBox: {
      marginTop: 10,
    },
    text: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#333333',
      marginBottom: 8,
    },
    bold: {
      fontFamily: 'Roboto-Bold',
      fontSize: 12,
      color: '#000000',
      marginTop: 10,
      marginBottom: 4,
    }
  });

  // Extremely basic markdown-to-pdf-text parser for structural rendering
  const renderContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('#')) {
        const cleanText = line.replace(/#/g, '').trim();
        return <Text key={idx} style={[styles.bold, { color: brandColor, fontSize: line.startsWith('##') ? 14 : 16 }]}>{cleanText}</Text>;
      }
      if (line.trim() === '') return <View key={idx} style={{ height: 10 }} />;
      if (line.startsWith('* ') || line.startsWith('- ')) {
         return <Text key={idx} style={styles.text}>• {line.substring(2)}</Text>;
      }
      return <Text key={idx} style={styles.text}>{line}</Text>;
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>{header}</Text>
          <Text style={styles.subtitle}>{authors}</Text>
        </View>
        <View style={styles.contentBox}>
          {renderContent(content)}
        </View>
        <View fixed style={{ position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#eeeeee', paddingTop: 10 }}>
           <Text style={{ fontSize: 9, color: '#999999', textAlign: 'center' }}>
             Generado con tecnología Docent Suite
           </Text>
        </View>
      </Page>
    </Document>
  );
};
