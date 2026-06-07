import Image from "next/image";
import Link from "next/link";
import Header from "./components/landing/header";
import Content from "./components/landing/content";


export default function Home() {
  return (
     <main>
      <Header />
      <Content />
    </main>
  );
}

