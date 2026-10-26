import { Link } from "react-router";

function ComposePage() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <section className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            <div className="mb-4">
              <p className="text-primary fw-semibold mb-1">Nueva publicación</p>
              <h1 className="h3 mb-2">¿Qué está pasando?</h1>
              <p className="text-secondary mb-0">
                Comparte una idea con tu comunidad.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="tweetContent">
                  Mensaje
                </label>
                <textarea
                  className="form-control"
                  id="tweetContent"
                  name="content"
                  rows="5"
                  placeholder="Escribe tu tweet..."
                  required
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <Link className="btn btn-link text-decoration-none px-0" to="/home">
                  Cancelar
                </Link>
                <button className="btn btn-primary" type="submit">
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ComposePage;