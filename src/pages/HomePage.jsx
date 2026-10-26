import { Link } from "react-router";
import { currentUser } from "../data/mockData";

function HomePage() {
  return (
    <>
      <section className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <p className="text-primary fw-semibold mb-1">Tu espacio en Clon de X</p>
          <h1 className="h2 mb-1">Hola, {currentUser.fullName}</h1>
          <p className="text-secondary mb-0">@{currentUser.username}</p>
        </div>

        <Link className="btn btn-primary" to="/compose">
          Publicar un tweet
        </Link>
      </section>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h6 text-secondary">Seguidores</h2>
              <p className="display-6 fw-bold mb-3">
                {currentUser.followersCount.toLocaleString("es-CO")}
              </p>
              <Link className="text-decoration-none" to="/followers">
                Ver seguidores
              </Link>
            </div>
          </section>
        </div>

        <div className="col-12 col-md-6">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h6 text-secondary">Siguiendo</h2>
              <p className="display-6 fw-bold mb-3">
                {currentUser.followingCount.toLocaleString("es-CO")}
              </p>
              <Link className="text-decoration-none" to="/following">
                Ver usuarios seguidos
              </Link>
            </div>
          </section>
        </div>

        <div className="col-12">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5">Mantente al día</h2>
              <p className="text-secondary">
                Revisa las publicaciones recientes de tu comunidad.
              </p>
              <Link className="btn btn-outline-primary" to="/feed">
                Ir al feed
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default HomePage;