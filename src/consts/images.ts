/**
 * Poids maximum du JSON d'une ligne sauvegardée dans le compte. Reprend la
 * contrainte SQL de la colonne `user_lines.data` :
 * `check (octet_length(data::text) <= 262144)`.
 */
export const MAX_LINE_DATA_BYTES = 256 * 1024;

/** Formats acceptés par le champ d'upload d'image. */
export const UPLOAD_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
