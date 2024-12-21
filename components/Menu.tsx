import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from '@nextui-org/react';
import { Image, Calendar, Book, DollarSign, LogOut } from 'react-feather';

export default function Menu() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <Navbar>
      <NavbarBrand>
        <span className="font-bold">Aile Albümü</span>
      </NavbarBrand>

      <NavbarContent>
        {session ? (
          <>
            <NavbarItem>
              <Button
                variant="light"
                startContent={<Image size={20} />}
                onPress={() => router.push('/albums')}
              >
                Albümler
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                variant="light"
                startContent={<Calendar size={20} />}
                onPress={() => router.push('/calendar')}
              >
                Takvim
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                variant="light"
                startContent={<Book size={20} />}
                onPress={() => router.push('/books')}
              >
                Kitaplar
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                variant="light"
                startContent={<DollarSign size={20} />}
                onPress={() => router.push('/budget')}
              >
                Bütçe
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut size={20} />}
                onPress={handleLogout}
              >
                Çıkış
              </Button>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Button variant="flat" onPress={() => router.push('/auth/login')}>
              Giriş Yap
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
} 