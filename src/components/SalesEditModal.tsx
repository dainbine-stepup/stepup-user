import React, { useState, useEffect } from "react";
import { Image, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from "react-native";

interface SalesRecord {
  sales_id: number;
  date: string;
  target: number;
  amount: number;
  rate: number;
}

interface Props {
  visible: boolean;
  data: SalesRecord | null;
  onClose: () => void;
  onSave: (updated: SalesRecord) => void;
  onDelete: (date: string) => void;
}

function SalesEditModal({ visible, data, onClose, onSave, onDelete }: Props) {
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (data) {
      setTarget(data.target.toString());
      setAmount(data.amount.toString());
    }
  }, [data]);

  const handleSave = () => {
    if (!data) return;

    const newTarget = parseInt(target);
    const newAmount = parseInt(amount);
    const rate = newTarget > 0 ? Math.round((newAmount / newTarget) * 100) : 0;

    onSave({
      ...data,
      target: newTarget,
      amount: newAmount,
      rate,
    });
  };

  if (!visible || !data) return null;

  return visible && data ? (
    <Modal visible={visible} transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{data.date} 수정</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Image style={styles.img} source={require('../img/icon-x.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>목표 금액</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={target}
                onChangeText={setTarget}
                placeholder="목표 금액 입력"
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputText}>달성 금액</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="달성 금액 입력"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => onDelete(data.date)}>
                <Text style={styles.buttonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  ) : null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    width: 20,
    height: 20,
  },
  img: {
    width: 20,
    height: 20,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    width: "30%",
    fontSize: 16,
  },
  input: {
    width: "60%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#038CD0",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SalesEditModal;
