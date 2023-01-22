import { Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import moment from 'moment';
import React from 'react';

interface GraphProps {
  activeColor: {color: string, index: number} | null;
  data: {
      key: string;
      value: moment.Moment[];
  }[];
  scale: string[];
  setActiveColor: React.Dispatch<React.SetStateAction<{
      color: string;
      index: number;
  } | null>>;
  total: number;
}

const Graph = ({ activeColor, data, scale, setActiveColor, total }: GraphProps) => (
  <Box
    display="flex"
    height={21}
  >
    {data.map((item, index, array) => (
      <React.Fragment key={item.value[0].unix()}>
        {activeColor?.index === index && (
          <Typography
            color="text.secondary"
            position="relative"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 60,
              justifyContent: 'flex-end',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
            }}
            variant="subtitle2"
            width={0}
            onMouseEnter={() => setActiveColor({
              color: chroma(scale[index]).saturate(1).hex(),
              index,
            })}
            onMouseLeave={() => setActiveColor(null)}
          >
            <span
              style={{
                backgroundColor: activeColor?.index === index
                  ? activeColor?.color
                  : chroma(scale[index]).hex(),
                height: 60,
                position: 'absolute',
                width: 2,
              }}
            />
            &nbsp;
            {item.key}
            <i>
              &nbsp;
              {`${item.value.length} ${item.value.length > 1 ? 'plays' : 'play'}`}
            </i>
          </Typography>
        )}
        <Box
          bgcolor={activeColor?.index === index
            ? activeColor?.color
            : chroma(scale[index]).hex()}
          marginRight={index !== array.length - 1 ? '2px' : ''}
          width={item.value.length / total}
          onMouseEnter={() => setActiveColor({
            color: chroma(scale[index]).saturate(1).hex(),
            index,
          })}
          onMouseLeave={() => setActiveColor(null)}
        />
      </React.Fragment>
    ))}
  </Box>
);

export default Graph;
