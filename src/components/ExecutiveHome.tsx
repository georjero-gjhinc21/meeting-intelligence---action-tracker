import React from 'react';
import BoardOverview from './BoardOverview';
import { ExecutiveNavTarget } from '../config/dashboard';

interface Props {
  navTarget?: ExecutiveNavTarget | null;
  onNavHandled?: () => void;
}

export default function ExecutiveHome({ navTarget, onNavHandled }: Props) {
  return <BoardOverview navTarget={navTarget} onNavHandled={onNavHandled} />;
}
