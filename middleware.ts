import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  { path: "/", whenAuthenticated: "allow" }, // Página de boas-vindas - acessível para todos
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/cadastro", whenAuthenticated: "redirect" },
  { path: "/recuperar-senha", whenAuthenticated: "redirect" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/"; // Redireciona para página de boas-vindas
const REDIRECT_WHEN_AUTHENTICATED_ROUTE = "/dashboard";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => path === route.path);
  const userToken = request.cookies.get("authToken")?.value;

  // Se não há token e é uma rota pública, permite acesso
  if (!userToken && publicRoute) {
    return NextResponse.next();
  }

  // Se não há token e não é rota pública, redireciona para login
  if (!userToken && !publicRoute) {
    return NextResponse.redirect(
      new URL(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE, request.url)
    );
  }

  // Se tem token, precisa validar
  if (userToken) {
    try {
      const response = await fetch(new URL("/api/auth/check", request.url), {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        // Token inválido - redireciona e limpa cookies
        const redirectResponse = NextResponse.redirect(
          new URL(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE, request.url)
        );
        redirectResponse.cookies.delete("authToken");
        redirectResponse.cookies.delete("role");
        return redirectResponse;
      }

      // Token válido - verifica comportamento da rota
      if (publicRoute) {
        if (publicRoute.whenAuthenticated === "redirect") {
          // Redireciona usuário autenticado para dashboard (ex: /login, /cadastro)
          return NextResponse.redirect(
            new URL(REDIRECT_WHEN_AUTHENTICATED_ROUTE, request.url)
          );
        } else if (publicRoute.whenAuthenticated === "allow") {
          // Permite acesso mesmo autenticado (ex: página de boas-vindas)
          return NextResponse.next();
        }
      }

      // Token válido e rota privada - permite acesso
      return NextResponse.next();
    } catch (error) {
      // Erro na validação - redireciona e limpa cookies
      const redirectResponse = NextResponse.redirect(
        new URL(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE, request.url)
      );
      redirectResponse.cookies.delete("authToken");
      redirectResponse.cookies.delete("role");
      return redirectResponse;
    }
  }

  // Fallback - permite o acesso
  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!.*\\.(?:png|jpg|jpeg|gif|svg|webp)$|_next/static|_next/image|api|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
