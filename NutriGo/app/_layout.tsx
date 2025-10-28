import React, { useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { UserProvider, useUser } from '../context/UserContext';
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
const LayoutInner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, loading } = useUser();

  // 🔐 preveri login status po inicializaciji
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/register') {
      router.replace('/login');
    }
  }, [user, loading, pathname]);

  // ⏳ če še nalaga, pokaži spinner (ampak po hookih!)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="pink" />
      </View>
    );
  }

  const hideNavbarOn = ['/login', '/register', '/SuccessScreen'];

  return (
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

            <NavButton onPress={() => router.push('/profile')}>
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
        </NavbarWrapper>
      )}
    </Container>
  );
};
 

// --- Glavni Layout z vsemi providerji ---
export default function Layout() {
  useEffect(() => {
    getAuthInstance();
  }, []);

  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <UserProvider>
          <FoodProvider>
            <LayoutInner />
          </FoodProvider>
        </UserProvider>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

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
  bottom: 25px;
  left: 15px;
  right: 15px;
  z-index: 100;
`;

interface NavbarProps {
  paddingBottom: number;
}

const Navbar = styled.View<NavbarProps>`
  height: 65px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  border-radius: 30px;
  padding-bottom: ${(props) => props.paddingBottom}px;
  elevation: 10;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
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
  bottom: 4px;
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
