import { useEffect, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const useHistoryStack = () => {
  const { key } = useLocation();
  const [activeKey, setActiveKey] = useState<string>(key);
  const [stack, setStack] = useState<string[]>([key]);
  const type = useNavigationType();
  const activeIndex = stack.findIndex((historyKey) => historyKey === activeKey);

  useEffect(() => {
    if (type === 'POP') {
      setActiveKey(key);
      return;
    }
    if (type === 'PUSH') {
      setStack((prev) => [...prev.slice(0, activeIndex + 1), key]);
      setActiveKey(key);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, type]);

  return {
    backward: activeIndex !== 0,
    forward: activeIndex < stack.length - 1,
  };
};

export default useHistoryStack;
