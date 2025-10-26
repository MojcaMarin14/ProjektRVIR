import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import styled from 'styled-components/native';
import { FoodProvider } from '@/components/FoodList';
import { getAuthInstance, firestore } from '../firebase/firebase';


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

  // ✅ Inicializacija Firebase Auth po zagonu Expo
  useEffect(() => {
    getAuthInstance();
  }, []);

  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        {/* ✅ UserProvider mora biti NAD FoodProvider */}
        <UserProvider>
          <FoodProvider>
            <Container>
              <Content>
                <Slot />
              </Content>

              <Navbar paddingBottom={insets.bottom}>
                <NavButton onPress={() => router.push('/plan')}>
                  <Ionicons
                    name="checkbox-sharp"
                    size={24}
                    color={pathname === '/plan' ? 'pink' : 'grey'}
                  />
                  {pathname === '/plan' && <PinkDot />}
                </NavButton>

                <NavButton onPress={() => router.push('/statistics')}>
                  <Ionicons
                    name="stats-chart"
                    size={24}
                    color={pathname === '/statistics' ? 'pink' : 'grey'}
                  />
                  {pathname === '/statistics' && <PinkDot />}
                </NavButton>

                <NavButton onPress={() => router.push('/recipes')}>
                  <Ionicons
                    name="search-sharp"
                    size={24}
                    color={pathname === '/recipes' ? 'pink' : 'grey'}
                  />
                  {pathname === '/recipes' && <PinkDot />}
                </NavButton>

                <NavButton onPress={() => router.push('/tracker')}>
                  <Ionicons
                    name="nutrition"
                    size={24}
                    color={pathname === '/tracker' ? 'pink' : 'grey'}
                  />
                  {pathname === '/tracker' && <PinkDot />}
                </NavButton>

                <NavButton onPress={() => router.push('/login')}>
                  <Ionicons
                    name="person"
                    size={24}
                    color={
                      pathname === '/profile' || pathname === '/login'
                        ? 'pink'
                        : 'grey'
                    }
                  />
                  {(pathname === '/profile' || pathname === '/login') && <PinkDot />}
                </NavButton>
              </Navbar>
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
  justify-content: space-between;
  background-color: white;
`;

const Content = styled.View`
  flex: 1;
`;

interface NavbarProps {
  paddingBottom: number;
}

const Navbar = styled.View<NavbarProps>`
  height: 60px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  padding-bottom: ${(props) => props.paddingBottom}px;
  padding-horizontal: 10px;
`;

const NavButton = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px;
`;

const PinkDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: pink;
  position: absolute;
  bottom: -4px;
`;

const styles = StyleSheet.create({
  floatingButton: {
    width: 30,
    height: 30,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
});

export default Layout;
