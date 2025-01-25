import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const RoomSelectWithAddOption = ({
  onRoomsChange, // Callback to notify parent about room changes
  placeholder = "Add or select rooms...", // Customizable placeholder
}) => {
  const [rooms, setRooms] = useState([]); // Local state for rooms

  // Handle adding a new room
  const handleCreateRoom = (inputValue) => {
    const newRoom = { label: inputValue, value: inputValue };
    setRooms((prevRooms) => [...prevRooms, newRoom]);

    // Notify parent about the updated rooms
    if (onRoomsChange) {
      onRoomsChange([...rooms, newRoom]);
    }
  };

  // Handle selection changes
  const handleChange = (selected) => {
    setRooms(selected || []); // Update local state with selected rooms

    // Notify parent about the updated rooms
    if (onRoomsChange) {
      onRoomsChange(selected || []);
    }
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <CreatableSelect
        isMulti
        options={rooms} // Use the current list of rooms as options
        value={rooms}
        onChange={handleChange}
        onCreateOption={handleCreateRoom}
        placeholder={placeholder}
      />
    </div>
  );
};

RoomSelectWithAddOption.propTypes = {
  onRoomsChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default RoomSelectWithAddOption;
