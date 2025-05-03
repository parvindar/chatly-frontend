import styled from 'styled-components';

const TypingAnimationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  
  .dot {

    width: 4px;
    height: 4px;
    background: #dcddde;
    border-radius: 50%;
    animation: typing 1.4s infinite;
    
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
  
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); }
  }
`;

const TypingAnimation = () => {
    return (
        <TypingAnimationContainer>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </TypingAnimationContainer>
    );
};

export default TypingAnimation;