/**
 * Index des modèles - Plateforme marsAI (CdC Lyon NERD)
 * Centralise les associations et l'export des modèles.
 */

import sequelize from "../db/connection.js";
import User from "./User.js";
import Film from "./Film.js";
import FilmSubtitle from "./FilmSubtitle.js";
import FilmLike from "./FilmLike.js";
import FilmComment from "./FilmComment.js";
import VideoUpload from "./VideoUpload.js";
import JuryRating from "./JuryRating.js";
import NewsletterSubscriber from "./NewsletterSubscriber.js";
import Event from "./Event.js";
import EventRegistration from "./EventRegistration.js";
import ScanLog from "./ScanLog.js";
import Notification from "./Notification.js";
import SubmissionConfig from "./SubmissionConfig.js";

/**
 * @bref Associations
 */

/**
 * @bref User <-> Film (Réalisateur soumet des films)
 */
User.hasMany(Film, { foreignKey: "userId" });
Film.belongsTo(User, { foreignKey: "userId" });

/**
 * @bref User <-> JuryRating <-> Film (Jury note les finalistes)
 */
User.hasMany(JuryRating, { foreignKey: "userId" });
JuryRating.belongsTo(User, { foreignKey: "userId" });
Film.hasMany(JuryRating, { foreignKey: "filmId" });
JuryRating.belongsTo(Film, { foreignKey: "filmId" });

/**
 * @bref Newsletter (optionnel : lié à User ou email seul)
 */
User.hasOne(NewsletterSubscriber, { foreignKey: "userId" });
NewsletterSubscriber.belongsTo(User, { foreignKey: "userId" });

/**
 * @bref Event <-> EventRegistration <-> User (réservations)
 */
Event.hasMany(EventRegistration, { foreignKey: "eventId" });
EventRegistration.belongsTo(Event, { foreignKey: "eventId" });
User.hasMany(EventRegistration, { foreignKey: "userId" });
EventRegistration.belongsTo(User, { foreignKey: "userId" });

/**
 * @bref Qui a scanné le QR (admin/agent) — association optionnelle
 */
User.hasMany(EventRegistration, {
  foreignKey: "checkedInByUserId",
  as: "eventCheckIns",
});
EventRegistration.belongsTo(User, {
  foreignKey: "checkedInByUserId",
  as: "checkedInBy",
});

/**
 * @bref ScanLog : historique des scans QR
 */
User.hasMany(ScanLog, { foreignKey: "scannedByUserId", as: "scanLogs" });
ScanLog.belongsTo(User, { foreignKey: "scannedByUserId", as: "scannedBy" });
EventRegistration.hasMany(ScanLog, { foreignKey: "registrationId", as: "scanLogs" });
ScanLog.belongsTo(EventRegistration, { foreignKey: "registrationId", as: "registration" });

/**
 * @bref Notifications
 */
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

/**
 * @bref User <-> VideoUpload
 */
User.hasMany(VideoUpload, { foreignKey: "userId" });
VideoUpload.belongsTo(User, { foreignKey: "userId" });

/**
 * @bref VideoUpload <-> Film (un upload vidéo peut être lié à un film)
 */
VideoUpload.hasOne(Film, { foreignKey: "videoUploadId", as: "film" });
Film.belongsTo(VideoUpload, { foreignKey: "videoUploadId", as: "videoUpload" });

/**
 * @bref Film <-> FilmSubtitle (sous-titres multi-langues)
 */
Film.hasMany(FilmSubtitle, { foreignKey: "filmId", as: "subtitles" });
FilmSubtitle.belongsTo(Film, { foreignKey: "filmId", as: "film" });

/**
 * @bref Film <-> FilmLike (likes des utilisateurs)
 */
Film.hasMany(FilmLike, { foreignKey: "filmId", as: "likes" });
FilmLike.belongsTo(Film, { foreignKey: "filmId" });
User.hasMany(FilmLike, { foreignKey: "userId", as: "filmLikes" });
FilmLike.belongsTo(User, { foreignKey: "userId" });

/**
 * @bref Film <-> FilmComment (commentaires multiples)
 */
Film.hasMany(FilmComment, { foreignKey: "filmId", as: "comments" });
FilmComment.belongsTo(Film, { foreignKey: "filmId" });
User.hasMany(FilmComment, { foreignKey: "userId", as: "filmComments" });
FilmComment.belongsTo(User, { foreignKey: "userId" });

export {
  sequelize,
  User,
  Film,
  FilmSubtitle,
  FilmLike,
  FilmComment,
  VideoUpload,
  JuryRating,
  NewsletterSubscriber,
  Event,
  EventRegistration,
  ScanLog,
  Notification,
  SubmissionConfig,
};

export default {
  sequelize,
  User,
  Film,
  FilmSubtitle,
  FilmLike,
  FilmComment,
  VideoUpload,
  JuryRating,
  NewsletterSubscriber,
  Event,
  EventRegistration,
  ScanLog,
  Notification,
  SubmissionConfig,
};
