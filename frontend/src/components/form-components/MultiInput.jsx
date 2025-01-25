import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import { forwardRef, useState } from "react";
import PropTypes from 'prop-types';

export const InputTags = forwardRef((props, ref) => {
  const { value, onChange, ...rest } = props;
  const [pendingDataPoint, setPendingDataPoint] = useState("");

  const addPendingDataPoint = () => {
    if (pendingDataPoint) {
      const newDataPoints = new Set([...value, pendingDataPoint]);
      onChange(Array.from(newDataPoints));
      setPendingDataPoint("");
    }
  };

  return (
    <>
      {/* Input and Add Button */}
      <div className="flex">
        <Input
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === " ") {
              e.preventDefault();
              addPendingDataPoint();
            }
          }}
          className="rounded-r-none"
          {...rest}
          ref={ref}
        />
        <Button
          type="button"
          variant="secondary"
          className="rounded-l-none border border-l-0"
          onClick={addPendingDataPoint}
        >
          Add
        </Button>
      </div>

      {/* Tags Display */}
      <div className="border rounded-md min-h-[2.5rem] overflow-y-auto p-2 flex gap-2 flex-wrap items-center">
        {value.map((item, idx) => (
          <Badge key={idx} variant="secondary">
            {item}
            <button
              type="button"
              className="w-3 ml-2"
              onClick={() => {
                onChange(value.filter((i) => i !== item));
              }}
            >
              <XIcon className="w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </>
  );
});
InputTags.displayName = "InputTags";

InputTags.propTypes = {
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};
InputTags.displayName = "InputTags";
