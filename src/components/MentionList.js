import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';
import { CustomScrollbar } from '../styles/styles';

const MentionOptions = styled.div`
  position: absolute;
  right: 10px;
  left: 10px;
  padding: 4px;
  bottom: 60px;
  background-color: #2c2f33;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 50;
  max-height: 95%;
  overflow-y: scroll;
  
  ${CustomScrollbar}
`;

const MentionOption = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
  gap: 8px;
  &:hover {
    background-color: #36393f;
  }

  img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }

  .left-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1; 
    overflow: hidden; 
  }

  .right-span {
    margin-left: auto; 
    padding-left: 8px; 
  }

  span.name {
    font-weight: 600;
    margin-left: 8px;
  }
  
`;

const MentionList = ({ options, onSelect }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!options.length) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (options[selectedIndex]) {
                        onSelect(options[selectedIndex]);
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (options[selectedIndex]) {
                        onSelect(options[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    onSelect(null);
                    break;
                case ' ': // space bar
                    onSelect(null);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [options, selectedIndex, onSelect]);

    useEffect(() => {
        if (listRef.current && listRef.current.children[selectedIndex]) {
            listRef.current.children[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [selectedIndex]);

    return (
        <MentionOptions ref={listRef}>
            {options.map((option, index) => (
                <MentionOption
                    key={option.id}
                    onClick={() => onSelect(option)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                        backgroundColor: index === selectedIndex ? '#36393f' : '#2c2f33'
                    }}
                    tabIndex={-1}
                >
                    <div className="left-group">
                        <img src={option.profile_pic || "https://i.pravatar.cc/40"} alt={option.name} referrerPolicy="no-referrer" />
                        <span className="name">{option.name}</span>
                    </div>
                    <span className="right-group user-id">{option.user_id}</span>
                </MentionOption>
            ))}
        </MentionOptions>
    );
};

export default MentionList;