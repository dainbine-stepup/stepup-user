import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (month: string) => void;
}

const MonthSelectorModal = ({ visible, onClose, onSelect }: Props) => {
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  return (
    <Modal visible={visible} transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>월 선택</Text>
            <FlatList
              data={months}
              keyExtractor={(item) => item}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => onSelect(item)}
                >
                  <Text>{item}월</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  item: {
    width: "30%",
    paddingVertical: 12,
    marginVertical: 6,
    marginHorizontal: 5,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  closeBtn: {
    width: "100%",
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#038CD0",
    alignItems: "center",
    borderRadius: 6,
  },
  closeBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default MonthSelectorModal;
