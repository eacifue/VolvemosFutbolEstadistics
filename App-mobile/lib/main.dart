import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app_mobile/providers/data_provider.dart';
import 'package:app_mobile/screens/home_screen.dart';
import 'package:app_mobile/screens/players_screen.dart';
import 'package:app_mobile/screens/admin_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => DataProvider()),
      ],
      child: MaterialApp(
        title: 'Football Stats App',
        theme: ThemeData(
          primaryColor: const Color(0xFF0B3D2E),
          scaffoldBackgroundColor: const Color(0xFF081A10),
          cardColor: const Color(0xFF173B28),
          colorScheme: ColorScheme.dark(
            background: const Color(0xFF081A10),
            surface: const Color(0xFF173B28),
            primary: const Color(0xFF0B3D2E),
            secondary: const Color(0xFFD4AF37),
            onPrimary: Colors.white,
            onSurface: Colors.white,
            onSecondary: Colors.black,
          ),
          textTheme: const TextTheme(
            displayLarge: TextStyle(color: Color(0xFFE8F2E1), fontFamily: 'Inter', fontWeight: FontWeight.bold),
            titleLarge: TextStyle(color: Color(0xFFE8F2E1), fontFamily: 'Inter', fontWeight: FontWeight.w700),
            bodyLarge: TextStyle(color: Color(0xFFE8F2E1), fontFamily: 'Inter'),
            bodyMedium: TextStyle(color: Color(0xFFB2C1B4), fontFamily: 'Inter'),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF0B3D2E),
            foregroundColor: Colors.white,
            elevation: 3,
            titleTextStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD4AF37),
              foregroundColor: Colors.black,
              minimumSize: const Size.fromHeight(44),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          bottomNavigationBarTheme: const BottomNavigationBarThemeData(
            backgroundColor: Color(0xFF0B3D2E),
            selectedItemColor: Color(0xFFD4AF37),
            unselectedItemColor: Colors.white70,
            selectedLabelStyle: TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
        home: const MainScreen(),
      ),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  static final List<Widget> _screens = [
    const HomeScreen(),
    const PlayersScreen(),
    const AdminScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Players',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.admin_panel_settings),
            label: 'Admin',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: const Color(0xFFD4AF37),
        unselectedItemColor: Colors.grey,
        backgroundColor: const Color(0xFF0B3D2E),
        onTap: _onItemTapped,
      ),
    );
  }
}
