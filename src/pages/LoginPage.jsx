import { Link } from "react-router";

function LoginPage() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="badge rounded-pill text-bg-primary mb-3">
                  Clon de X
                </span>
                <h1 className="h3 mb-2">Iniciar sesión</h1>
                <p className="text-secondary mb-0">
                  Vuelve a conectarte con la comunidad.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="username">
                    Nombre de usuario
                  </label>
                  <input
                    className="form-control"
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Escribe tu nombre de usuario"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    className="form-control"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Escribe tu contraseña"
                    required
                  />
                </div>

                <button className="btn btn-primary w-100" type="submit">
                  Iniciar sesión
                </button>
              </form>

              <div className="d-flex align-items-center gap-3 my-4">
                <hr className="flex-grow-1" />
                <span className="small text-secondary">o continúa con</span>
                <hr className="flex-grow-1" />
              </div>

              <button
                className="btn btn-outline-secondary w-100"
                type="button"
              >
                Continuar con Google
              </button>

              <p className="text-center text-secondary mt-4 mb-0">
                ¿Todavía no tienes cuenta?{" "}
                <Link className="text-decoration-none" to="/register">
                  Regístrate
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;