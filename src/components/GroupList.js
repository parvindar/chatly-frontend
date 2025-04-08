import React from 'react';
import styled from 'styled-components';
import * as colors from '../styles/colors';

// const GroupListContainer = styled.div`
//   width: 250px;
//   background-color: ${colors.background};
//   border-right: 1px solid ${colors.border};
//   height: 100vh;
//   overflow-y: auto;
// `;

// const GroupItem = styled.div`
//   padding: 15px;
//   cursor: pointer;
//   &:hover {
//     background-color: ${colors.hover};
//   }
// `;

const GroupList = ({ groups, onSelectGroup }) => {
  return (<></>
    // <GroupListContainer>
    //   {groups.map((group) => (
    //     <GroupItem key={group.id} onClick={() => onSelectGroup(group)}>
    //       {group.name}
    //     </GroupItem>
    //   ))}
    // </GroupListContainer>
  );
};

export default GroupList;