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
              <Text>닫기</Text>
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modal: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  item: {
    width: "30%",
    paddingVertical: 10,
    alignItems: "center",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
});

export default MonthSelectorModal;
