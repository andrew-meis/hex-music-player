import { Box, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { FiCheckCircle } from 'react-icons/all';
import { AppSettings } from 'types/interfaces';

const colors = [
  { title: 'Bittersweet', value: '#ff6255' },
  { title: 'Orange', value: '#ff7538' },
  { title: 'Old Rose', value: '#c17767' },
  { title: 'Sunglow', value: '#ffcc33' },
  { title: 'Pistachio', value: '#93c572' },
  { title: 'Jade', value: '#00a86b' },
  { title: 'Hex Green', value: '#1caf7b' },
  { title: 'Moonstone', value: '#57a7b2' },
  { title: 'Vista Blue', value: '#7c9ed9' },
  { title: 'Amethyst', value: '#9966cc' },
  { title: 'Magenta', value: '#f653a6' },
  { title: 'French Gray', value: '#bebfc5' },
];

interface ColorPickerProps {
  primaryColor: string;
  updateConfig: (key: keyof AppSettings, value: any) => Promise<void>;
}

const ColorPicker = ({ primaryColor, updateConfig }: ColorPickerProps) => {
  const [hoveredColor, setHoveredColor] = useState('');
  const currentColor = colors.find((color) => color.value === primaryColor)!;

  const handleColorOption = async (newColor: string) => {
    await updateConfig('primaryColor', newColor);
  };

  return (
    <Box>
      <Box
        display="flex"
        flexWrap="wrap"
        gap="4px"
        my="3px"
        width={164}
        onMouseLeave={() => setHoveredColor('')}
      >
        {colors.map((color) => (
          <Box
            bgcolor={color.value}
            borderRadius="4px"
            height={38}
            key={color.value}
            minWidth={38}
            onClick={() => handleColorOption(color.value)}
            onMouseEnter={() => setHoveredColor(color.title)}
          >
            {color.value === currentColor.value && (
              <Box
                alignItems="center"
                display="flex"
                height={38}
                justifyContent="center"
                width={38}
              >
                <SvgIcon>
                  <FiCheckCircle />
                </SvgIcon>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Typography textAlign="center">{hoveredColor || currentColor.title}</Typography>
    </Box>
  );
};

export default ColorPicker;
