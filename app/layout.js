import './globals.css';

export const metadata = {
  title: 'Vinsup Skill Academy — Portfolio Builder',
  description: 'Build your professional portfolio with Vinsup Skill Academy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
