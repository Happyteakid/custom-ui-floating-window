import { AppContextWrapper } from '../shared/context';
import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const MyApp = ({ Component, pageProps }) => {
  return (
    <AppContextWrapper>
      <Component {...pageProps} />
    </AppContextWrapper>
  );
};

export default MyApp;
