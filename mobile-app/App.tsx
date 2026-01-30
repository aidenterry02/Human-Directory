import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, SafeAreaView, 
  TextInput, TouchableOpacity, Keyboard, ActivityIndicator, Alert
} from 'react-native';

// --- CONFIGURATION ---
// Replace with the IP address from your Expo terminal (e.g., 172.20.10.3)
const BASE_URL = 'http://192.168.92.164:3000'; 
const API_URL = `${BASE_URL}/contacts`;

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [newName, setNewName] = useState('');
  const [category, setCategory] = useState('Friend');
  const [loading, setLoading] = useState(true);

  // 1. Fetch contacts from your Backend
  const fetchContacts = () => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        // Safety: Ensure we are setting an array so FlatList doesn't crash
        if (Array.isArray(json)) {
          const [contacts, setContacts] = useState<any[]>([]);
        } else {
          console.error("Server didn't return an array:", json);
          setContacts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
        Alert.alert("Connection Error", "Could not reach the server. Is your IP correct?");
      });
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 2. Add a new person to the Directory
  const addContact = () => {
    if (newName.trim().length === 0) return;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newName, 
        category: category // Using "e" as requested
      }),
    })
    .then(() => {
      setNewName('');
      fetchContacts();
      Keyboard.dismiss();
    })
    .catch((err) => console.error("Add Error:", err));
  };

  // 3. Reset the reminder timer
  const markAsContacted = (id: number) => {
    fetch(`${API_URL}/${id}/contacted`, {
      method: 'POST',
    })
    .then(() => fetchContacts())
    .catch((err) => console.error("Update Error:", err));
  };

  // 4. Render each person in the list
  const renderContact = ({ item }: { item: any }) => {
    // If a database record is broken, don't crash the app
    if (!item) return null;

    // Soft Urgency Logic: Is the reminder date in the past?
    const isOverdue = item.nextReminder && new Date(item.nextReminder) < new Date();

    return (
      <View style={[styles.card, isOverdue && styles.overdueCard]}>
        <View style={styles.cardInfo}>
          <Text style={[styles.name, isOverdue && styles.overdueName]}>
            {item.name || "Unknown"} {isOverdue ? '⏳' : ''}
          </Text>
          <Text style={styles.categoryTag}>{item.category || "General"}</Text>
          <Text style={styles.status}>
            {isOverdue ? "Needs Attention!" : (item.status || "Connected")}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.checkButton, isOverdue && styles.overdueButton]} 
          onPress={() => item.id && markAsContacted(item.id)}
        >
          <Text style={styles.checkButtonText}>✓</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Human Directory</Text>
      
      {/* INPUT SECTION */}
      <View style={styles.addSection}>
        <TextInput 
          style={styles.input}
          placeholder="Who should we add?"
          value={newName}
          onChangeText={setNewName}
          placeholderTextColor="#999"
        />
        
        <View style={styles.categoryRow}>
          {['Family', 'Friend', 'Acquaintance'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setCategory(cat)}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={styles.addButtonText}>Save to Cloud</Text>
        </TouchableOpacity>
      </View>

      {/* LIST SECTION */}
      {loading ? (
        <ActivityIndicator size="large" color="#55E6C1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={contacts}
          // The "toString" safety net:
          keyExtractor={(item, index) => item?.id?.toString() || `key-${index}`}
          renderItem={renderContact}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No humans found. Add your first one!</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#2D3436' },
  addSection: { backgroundColor: 'white', padding: 20, borderBottomWidth: 1, borderColor: '#EEE', elevation: 4 },
  input: { backgroundColor: '#F0F0F0', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15, color: '#000' },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  catBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#EEE' },
  catBtnActive: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#55E6C1' },
  catText: { color: '#636E72', fontWeight: '500' },
  catTextActive: { color: '#2E7D32', fontWeight: 'bold' },
  addButton: { backgroundColor: '#2D3436', padding: 15, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: { 
    backgroundColor: 'white', flexDirection: 'row', padding: 20, marginVertical: 8, marginHorizontal: 20, 
    borderRadius: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 
  },
  overdueCard: { backgroundColor: '#FFF5F5', borderLeftWidth: 5, borderLeftColor: '#FF7675' },
  cardInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2D3436' },
  overdueName: { color: '#D63031' },
  categoryTag: { fontSize: 12, color: '#55E6C1', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  status: { fontSize: 13, color: '#636E72', marginTop: 4 },
  checkButton: { backgroundColor: '#55E6C1', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  overdueButton: { backgroundColor: '#FF7675' },
  checkButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});