import Image from "next/image"
import Link from "next/link"
import { NotificationBell } from "./notification-bell"

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DocuFlota Logo" width={120} height={60} className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-primary">DocuFlota</h1>
              <p className="text-xs text-muted-foreground">Gestión de Documentación</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/fleet"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Flota
              </Link>
              <Link
                href="/clients"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Clientes
              </Link>
              <Link
                href="/upload"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Subir Documento
              </Link>
            </nav>
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  )
}
