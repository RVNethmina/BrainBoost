// app/src/components/TimePicker.tsx
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PALETTE } from '@/app/design/colors';

interface TimePickerProps {
  visible: boolean;
  initialTime: string;
  onClose: () => void;
  onSelect: (time: string) => void;
  isDark: boolean;
  fontScale: number;
}

const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  initialTime,
  onClose,
  onSelect,
  isDark,
  fontScale,
}) => {
  const [hours, minutes] = initialTime.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);

  const handleConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onSelect(timeString);
    onClose();
  };

  const bgColor = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#2C3E3E';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          <Text style={[styles.title, { fontSize: 20 * fontScale, color: textColor }]}>
            Select Time
          </Text>

          <View style={styles.pickerRow}>
            {/* Hours */}
            <View style={styles.column}>
              <TouchableOpacity
                style={[styles.arrowButton, { backgroundColor: PALETTE.lightTeal }]}
                onPress={() => setSelectedHour((selectedHour + 1) % 24)}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              
              <View style={[styles.valueBox, { borderColor: PALETTE.teal }]}>
                <Text style={[styles.valueText, { fontSize: 32 * fontScale, color: textColor }]}>
                  {selectedHour.toString().padStart(2, '0')}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.arrowButton, { backgroundColor: PALETTE.lightTeal }]}
                onPress={() => setSelectedHour((selectedHour - 1 + 24) % 24)}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.separator, { fontSize: 32 * fontScale, color: textColor }]}>:</Text>

            {/* Minutes */}
            <View style={styles.column}>
              <TouchableOpacity
                style={[styles.arrowButton, { backgroundColor: PALETTE.lightTeal }]}
                onPress={() => setSelectedMinute((selectedMinute + 5) % 60)}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              
              <View style={[styles.valueBox, { borderColor: PALETTE.teal }]}>
                <Text style={[styles.valueText, { fontSize: 32 * fontScale, color: textColor }]}>
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.arrowButton, { backgroundColor: PALETTE.lightTeal }]}
                onPress={() => setSelectedMinute((selectedMinute - 5 + 60) % 60)}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: PALETTE.lightPink }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { fontSize: 16 * fontScale }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: PALETTE.teal }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { fontSize: 16 * fontScale, color: '#fff' }]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  column: {
    alignItems: 'center',
  },
  arrowButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 8,
  },
  arrowText: {
    fontSize: 20,
    color: '#fff',
  },
  valueBox: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
  },
  valueText: {
    fontWeight: 'bold',
  },
  separator: {
    marginHorizontal: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default TimePicker;