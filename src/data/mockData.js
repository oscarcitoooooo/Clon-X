export const users = [
  { id: "u01", fullName: "Oscar", username: "oscar", followersCount: 14, followingCount: 11 },
  { id: "u02", fullName: "Yoseth", username: "yoseth", followersCount: 12, followingCount: 8 },
  { id: "u03", fullName: "Ana María Gómez", username: "anamaria", followersCount: 23, followingCount: 17 },
  { id: "u04", fullName: "Carlos Ruiz", username: "carlosruiz", followersCount: 18, followingCount: 12 },
  { id: "u05", fullName: "Daniela Torres", username: "danitorres", followersCount: 31, followingCount: 20 },
  { id: "u06", fullName: "Esteban Martínez", username: "esteban", followersCount: 9, followingCount: 14 },
  { id: "u07", fullName: "Fernanda López", username: "ferlopez", followersCount: 28, followingCount: 22 },
  { id: "u08", fullName: "Gabriel Herrera", username: "gabrielh", followersCount: 16, followingCount: 10 },
  { id: "u09", fullName: "Isabella Castro", username: "isacastro", followersCount: 42, followingCount: 30 },
  { id: "u10", fullName: "Juan David Rojas", username: "juandavid", followersCount: 11, followingCount: 9 },
  { id: "u11", fullName: "Laura Méndez", username: "lauram", followersCount: 37, followingCount: 26 },
  { id: "u12", fullName: "Mateo Vargas", username: "mateov", followersCount: 15, followingCount: 13 },
  { id: "u13", fullName: "Valentina Cruz", username: "valecruz", followersCount: 21, followingCount: 18 },
];

export const currentUserId = "u01";
export const currentUser = users.find((user) => user.id === currentUserId);

export const followingIds = [
  "u02", "u03", "u04", "u05", "u06", "u07",
  "u08", "u09", "u10", "u11", "u12",
];

export const followerIds = [
  "u03", "u04", "u05", "u06", "u07", "u08",
  "u09", "u10", "u11", "u12", "u13",
];
export const tweets = [
  { id: "t01", userId: "u02", content: "Arrancando la semana con nuevas ideas para el proyecto.", createdAt: "2026-10-25T16:30:00-05:00" },
  { id: "t02", userId: "u01", content: "Ya tenemos lista la estructura inicial de la aplicación.", createdAt: "2026-10-25T14:15:00-05:00" },
  { id: "t03", userId: "u02", content: "Un buen diseño empieza por escuchar a quienes lo van a usar.", createdAt: "2026-10-24T19:45:00-05:00" },
  { id: "t04", userId: "u03", content: "Hoy aprendí algo nuevo de React y lo voy a poner en práctica.", createdAt: "2026-10-24T11:20:00-05:00" },
  { id: "t05", userId: "u02", content: "Paso a paso, cada parte del proyecto va tomando forma.", createdAt: "2026-10-23T17:00:00-05:00" },
  { id: "t06", userId: "u02", content: "Compartir avances pequeños ayuda a mantener el ritmo.", createdAt: "2026-10-22T13:35:00-05:00" },
  { id: "t07", userId: "u02", content: "Una interfaz clara hace que todo se sienta más sencillo.", createdAt: "2026-10-21T18:10:00-05:00" },
  { id: "t08", userId: "u02", content: "Hoy toca revisar detalles y mejorar la experiencia.", createdAt: "2026-10-20T09:50:00-05:00" },
  { id: "t09", userId: "u02", content: "Las buenas ideas también necesitan una buena organización.", createdAt: "2026-10-19T15:25:00-05:00" },
  { id: "t10", userId: "u02", content: "Un avance más para el clon de X.", createdAt: "2026-10-18T12:40:00-05:00" },
  { id: "t11", userId: "u02", content: "Probando componentes reutilizables para las publicaciones.", createdAt: "2026-10-17T20:05:00-05:00" },
  { id: "t12", userId: "u02", content: "La colaboración hace que el proyecto avance mejor.", createdAt: "2026-10-16T10:30:00-05:00" },
  { id: "t13", userId: "u02", content: "Cerrando la semana con otro paso completado.", createdAt: "2026-10-15T16:55:00-05:00" },
];