import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

export const InputTags = forwardRef(({ value, onChange, ...rest }, ref) => {
  const [pendingTag, setPendingTag] = useState('');

  const addTag = () => {
    if (pendingTag) {
      const newTags = [...value, pendingTag];
      onChange(newTags);
      setPendingTag('');
    }
  };

  return (
    <>
      <div className="flex">
        <Input
          value={pendingTag}
          onChange={(e) => setPendingTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
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
          onClick={addTag}
        >
          Add
        </Button>
      </div>

      <div className="border rounded-md min-h-[2.5rem] p-2 flex gap-2 flex-wrap items-center mt-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="focus:outline-none"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </>
  );
});

InputTags.propTypes = {
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
InputTags.displayName = 'InputTags';
