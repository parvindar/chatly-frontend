import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa';
import colors from '../styles/colors';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color:rgb(31, 35, 44); 
  transition: background-color 0.5s ease;

  color: ${colors.primary};
  font-size: 18px;
  font-weight: bold;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const LoadingText = styled.div`
//   margin-left: 10px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingComponent = () => {
    return <LoadingContainer>
        {/* <SpinnerContainer>
            <FaSpinner />
        </SpinnerContainer> */}
        <LoadingText>Loading...</LoadingText>
    </LoadingContainer>;
};

export default LoadingComponent;


