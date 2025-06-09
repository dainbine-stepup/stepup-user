import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (year: string) => void;
}

const YearSelectorModal = ({ visible, onClose, onSelect }: Props) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));

  return (
    <Modal visible={visible} transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>연도 선택</Text>
              <FlatList
                style={styles.listContainer}
                data={years}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => onSelect(item)}
                  >
                    <Text>{item}년</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 10,
    marginBottom: 10,
  },
  listContainer: {
    maxHeight: 300,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  closeBtn: {
    width: "100%",
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#038CD0",
    alignItems: "center",
    borderRadius: 6,
  },
  closeBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  }
});


export default YearSelectorModal;
