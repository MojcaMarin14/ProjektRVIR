import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import styled from 'styled-components/native';
import { FoodProvider } from '@/components/FoodList';
import { getAuthInstance } from '../firebase/firebase';

// --- Apollo Client Setup ---
const httpLink = createHttpLink({
  uri: 'https://melokovka.eu-central-a.ibm.stepzen.net/api/impressive-turkey/__graphql',
});

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    Authorization:
      'apikey melokovka::local.net+1000::01d832eddc639a2eac959379430577a5d718de95f6d12c95f6b67b0114a815d6',
  },
}));

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// --- Glavni Layout ---
const Layout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getAuthInstance();
  }, []);

  const hideNavbarOn = ['/login', '/register', '/SuccessScreen'];

  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <UserProvider>
          <FoodProvider>
            <Container>
              <Content>
                <Slot />
              </Content>

              {!hideNavbarOn.includes(pathname) && (
                <NavbarWrapper>
                  <Navbar paddingBottom={insets.bottom}>
                    <NavButton onPress={() => router.push('/plan')}>
                      <Ionicons
                        name="checkbox-sharp"
                        size={26}
                        color={pathname === '/plan' ? '#ff4da6' : '#555'}
                        style={{ opacity: 1 }}
                      />
                      {pathname === '/plan' && <PinkDot />}
                    </NavButton>

                    <NavButton onPress={() => router.push('/statistics')}>
                      <Ionicons
                        name="stats-chart"
                        size={26}
                        color={pathname === '/statistics' ? '#ff4da6' : '#555'}
                      />
                      {pathname === '/statistics' && <PinkDot />}
                    </NavButton>

                    <NavButton onPress={() => router.push('/recipes')}>
                      <Ionicons
                        name="search-sharp"
                        size={26}
                        color={pathname === '/recipes' ? '#ff4da6' : '#555'}
                      />
                      {pathname === '/recipes' && <PinkDot />}
                    </NavButton>

                    <NavButton onPress={() => router.push('/tracker')}>
                      <Ionicons
                        name="nutrition"
                        size={26}
                        color={pathname === '/tracker' ? '#ff4da6' : '#555'}
                      />
                      {pathname === '/tracker' && <PinkDot />}
                    </NavButton>

                    <NavButton onPress={() => router.push('/profile')}>
                      <Ionicons
                        name="person"
                        size={26}
                        color={
                          pathname === '/profile' || pathname === '/login'
                            ? '#ff4da6'
                            : '#555'
                        }
                      />
                      {(pathname === '/profile' || pathname === '/login') && <PinkDot />}
                    </NavButton>
                  </Navbar>
                </NavbarWrapper>
              )}
            </Container>
          </FoodProvider>
        </UserProvider>
      </SafeAreaProvider>
    </ApolloProvider>
  );
};

// --- Styled Components ---
const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const Content = styled.View`
  flex: 1;
  background-color: white;
`;
const NavbarWrapper = styled.View`
  position: absolute;
  bottom: 10px;   /* 🔽 manj prostora spodaj */
  left: 25px;     /* 🔽 manj široko belo polje */
  right: 25px;
  z-index: 100;
`;


interface NavbarProps {
  paddingBottom: number;
}

const Navbar = styled.View<NavbarProps>`
  height: 65px; /* 🔽 manjše belo polje */
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  border-radius: 20px; /* 🔽 manj zaobljen */
  padding-vertical: 4px; /* 🔽 manj notranjega prostora */
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
`;

const NavButton = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const PinkDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #ff4da6;
  position: absolute;
  bottom: 6px;
`;

export default Layout;
