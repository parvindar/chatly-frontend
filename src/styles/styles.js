import styled, { css } from 'styled-components';

export const CustomScrollbar = css`
  &::-webkit-scrollbar {
    height: 4px; /* Added height for horizontal scrollbars */
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #2c2f33;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4A7BCC;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #3a66a1;
  }

`;

