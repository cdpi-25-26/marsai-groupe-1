import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      translation: {
        nav: {
          home: "Accueil",
          discover: "Découvrir",
          competition: "Concours",
          agenda: "Agenda",
          profile: "Profil",
          submit: "Soumettre"
        },
        lang: {
          fr: "FR",
          en: "EN"
        },
        auth: {
          login: "Se connecter",
          join: "Participer",
          signup: "S'inscrire",
          pages: {
            login: {
              title: "CONNEXION",
              subtitle: "PROTOCOLE D'ACCES MARSAI",
              usernameLabel: "IDENTIFIANT DE SESSION",
              usernamePlaceholder: "votre identifiant",
              passwordLabel: "CLE CRYPTOGRAPHIQUE",
              keepSession: "MAINTENIR SESSION",
              reset: "RESET ?",
              submit: "INITIALISER FLUX",
              submitting: "CONNEXION...",
              noAccount: "NOUVEAU VOYAGEUR ?",
              signUp: "Generer Identite",
              alreadyConnected: "Vous etes deja connecte en tant que",
              backHome: "Retour a l'accueil",
              errorDefault: "Erreur de connexion au serveur",
              usernameRequired: "Identifiant requis",
              passwordRequired: "Cle requise"
            },
            register: {
              title: "INSCRIPTION",
              subtitle: "NOUVEAU PROFIL CYBER-PREMIUM",
              usernameLabel: "ALIAS CITOYEN",
              usernamePlaceholder: "John Doe",
              emailLabel: "CANAL DE COMMUNICATION",
              emailPlaceholder: "nom@exemple.com",
              passwordLabel: "CLE D'ACCES",
              confirmLabel: "VERIFICATION",
              terms: "JE CONSENS AUX TERMES ET CONDITIONS GENERALES",
              submit: "GENERER IDENTITE",
              submitting: "INSCRIPTION...",
              hasAccount: "DEJA ENREGISTRE ?",
              login: "Ouvrir Session",
              alreadyConnected: "Vous etes deja connecte en tant que",
              backHome: "Retour a l'accueil",
              errorDefault: "Erreur lors de l'inscription",
              usernameRequired: "L'alias citoyen est requis",
              emailInvalid: "Email invalide",
              passwordMin: "Minimum 6 caracteres",
              confirmRequired: "Veuillez confirmer le mot de passe",
              passwordMismatch: "Les mots de passe ne correspondent pas"
            }
          }
        },
        pages: {
          landing: {
            festival: "Festival International",
            title: "Cinéma et Intelligence Artificielle",
            location: "Marseille",
            exploreFilms: "Explorer les films",
            agenda: "Voir l'agenda",
            competition: {
              label: "Sélection Officielle",
              title: "Films en Compétition",
              description: "Découvrez une sélection de films créatifs utilisant l'IA, soigneusement sélectionnés par notre jury international.",
              viewSelection: "Voir la sélection complète"
            },
            timeline: {
              label: "Le Protocole Temporel",
              title: "Notre Parcours",
              preparation: "De préparation",
              selection: "Films sélectionnés",
              experience: "Expérience Web3",
              marseille: "À Marseille",
              join: "Rejoindre l'aventure"
            },
            conferences: {
              title: "Deux Journées",
              subtitle: "de Conférences Exceptionnelles",
              item1: "Rencontres avec les créateurs IA de demain",
              item2: "Ateliers pratiques et démonstrations en direct",
              item3: "Débats sur l'avenir du cinéma et de l'IA",
              fullAgenda: "Voir l'agenda complet",
              projections: "Projections Cinématographiques",
              projectionsDesc: "Découvrez les meilleurs films de la compétition en avant-première.",
              workshops: "Ateliers Techniques",
              workshopsDesc: "Maîtrisez les outils de création IA avec nos experts.",
              awards: "Cérémonie des Prix",
              awardsDesc: "Célébrez les talents exceptionnels du festival."
            },
            night: {
              label: "Innovation Nocturne",
              title: "Mars.AI",
              description: "Une soirée immersive où l'art, la technologie et la culture convergent.",
              experience: "Rejoignez-nous pour une expérience inoubliable.",
              date: "8 FÉVRIER",
              time: "20:00 - 04:00",
              book: "Réserver votre place"
            },
            numbers: {
              title: "Les Chiffres",
              subtitle: "du Festival",
              scale: "Dimension Globale",
              countries: "Pays représentés",
              films: "Films soumis"
            },
            jury: {
              label: "Jury International",
              title: "Le Jury",
              description: "Cinq experts reconnus de l'art numérique et du cinéma IA pour évaluer les œuvres en compétition."
            },
            partners: {
              label: "Partenaires",
              title: "Nos Partenaires Stratégiques"
            },
            footer: {
              tagline: "Où l'imagination rencontre l'intelligence artificielle.",
              nav: "Navigation",
              gallery: "Galerie",
              program: "Programme",
              top50: "Top 50",
              ticketing: "Billetterie",
              newsletter: "Le Bulletin",
              email: "Votre email",
              ok: "OK",
              copyright: "© 2026 MARS.AI Festival. Tous droits réservés.",
              design: "Design par l'équipe créative",
              legal: "Mentions légales"
            }
          },
          home: {
            title: "Bienvenue sur MarsAI",
            subtitle: "La plateforme des talents musicaux"
          },
          discover: {
            title: "Explorer",
            worksCount: "œuvres",
            search: "Rechercher un film, un réalisateur...",
            by: "by",
            noResults: "Aucun résultat",
            noResultsDesc: "Aucun film ne correspond à votre recherche.",
            reset: "Réinitialiser",
            categories: {
              all: "Tous",
              scifi: "Sci-Fi",
              digitalArt: "Art Numérique",
              animation: "Animation",
              experimental: "Expérimental",
              romance: "Romance",
              drama: "Drame",
              comedy: "Comédie",
              thriller: "Thriller",
              philosophical: "Philosophique"
            }
          },
          competition: {
            live: "CLASSEMENT EN DIRECT • MARSAI 2026",
            title: "LE TOP 50",
            subtitle: "Découvrez les créations qui captivent l'imagination. Les 10 premiers films accéderont à la phase finale de sélection du jury.",
            general: "Compétition Générale",
            film: "Film",
            performance: "Performance",
            applause: "applaudis",
            views: "vues",
            by: "by"
          },
          agenda: {
            infoPratiques: "Infos Pratiques",
            date: "13 JUIN 2026",
            city: "MARSEILLE",
            venueName: "La Plateforme_",
            venueDesc: "L'épicentre de la révolution créative marseillaise. 4000m² dédiés à l'image et au futur.",
            programTitle: "Programme des Conférences",
            conferences: [
              { type: "Social", title: "Accueil & Café Networking" },
              { type: "Keynote", title: "Conférence d'ouverture : L'IA au service du Cinéma" },
              { type: "Break", title: "Déjeuner Libre" },
              { type: "Cinéma", title: "Projection Sélection Officielle" },
              { type: "Talk", title: "Table Ronde : Futurs Souhaitables" },
              { type: "Awards", title: "Grand Prix & Cérémonie de Clôture" },
              { type: "Party", title: "MARS.A.I Night - DJ Set Immersif" }
            ],
            access: {
              title: "Accès",
              transport: {
                title: "Transports en commun",
                desc: "Tram T2 / T3 - Arrêt Arenc Le Silo.\nMétro M2 - Station Désirée Clary."
              },
              car: {
                title: "Voiture",
                desc: "Autoroute A55 - Sortie 2.\nParking Indigo Quai du Lazaret à 200m."
              },
              address: {
                title: "Adresse",
                desc: "12 Rue d'Uzes, 13002 Marseille (Entrée Principale)."
              },
              mapAlt: "Carte d'accès"
            },
            workshopsSection: {
              sectionTitle: "Ateliers Pratiques",
              title: "Workshops",
              subtitle: "IA Créative",
              desc: "Passez de la théorie à la pratique avec les meilleurs experts internationaux. Attention, places limitées (max 15 par session).",
              coach: "Coach",
              availability: "Disponibilité",
              reserve: "Réserver ma place",
              items: [
                { title: "Génération Vidéo : Les bases", capacity: "10 places restantes" },
                { title: "IA & Scénario : Co-écriture", capacity: "8 places restantes" },
                { title: "Post-prod IA & Effets Spéciaux", capacity: "12 places restantes" },
                { title: "Éthique & Droit de l'IA", capacity: "5 places restantes" }
              ]
            }
          },
          profile: {
            follow: "Suivre",
            biography: "Biographie",
            bio: "\"Chaque image que je crée est une fenêtre ouverte sur un monde qui n'existe pas encore. L'IA est mon pinceau, l'imagination est ma toile.\"",
            location: "Chine",
            since: "Depuis Janvier 2024",
            audience: "Audience",
            subscribers: "abonnés",
            subscriptions: "abonnements",
            stats: {
              films: "Films publiés",
              applause: "Applaudissements",
              views: "Vues totales"
            },
            tabs: {
              portfolio: "Portfolio",
              favorites: "Favoris",
              bio: "Bio"
            },
            views: "vues",
            noSubmissions: "Aucune soumission pour l'instant."
          },
          detail: {
            notFound: "Film introuvable",
            backToDiscover: "Retour à la découverte",
            close: "Fermer",
            marsaiTop: "MARS.AI TOP 50",
            directorManifesto: "Manifeste du Réalisateur",
            aiStack: "Stack IA",
            engine: "Moteur",
            discussion: "Discussion",
            opinions: "opinions",
            writeCritique: "Écrire une critique...",
            impactMetrics: "Métriques d'impact",
            uniqueViews: "Vues uniques",
            applause: "Applaudissements",
            shares: "Partages",
            technicalSheet: "Fiche Technique",
            country: "Pays",
            ratio: "Format",
            premiere: "Première"
          },
          soumission: {
            title: "Soumission",
            description: "Bienvenue sur la page de soumission."
          }
        }
      }
    },
    en: {
      translation: {
        nav: {
          home: "Home",
          discover: "Discover",
          competition: "Competition",
          agenda: "Agenda",
          profile: "Profile",
          submit: "Submit"
        },
        lang: {
          fr: "FR",
          en: "EN"
        },
        auth: {
          login: "Log In",
          join: "Join",
          signup: "Sign Up",
          pages: {
            login: {
              title: "LOGIN",
              subtitle: "MARSAI ACCESS PROTOCOL",
              usernameLabel: "SESSION IDENTIFIER",
              usernamePlaceholder: "your username",
              passwordLabel: "CRYPTOGRAPHIC KEY",
              keepSession: "KEEP SESSION",
              reset: "RESET?",
              submit: "INITIALIZE FLUX",
              submitting: "CONNECTING...",
              noAccount: "NEW TRAVELER?",
              signUp: "Generate Identity",
              alreadyConnected: "You are already logged in as",
              backHome: "Back to home",
              errorDefault: "Server connection error",
              usernameRequired: "Username required",
              passwordRequired: "Key required"
            },
            register: {
              title: "REGISTER",
              subtitle: "NEW CYBER-PREMIUM PROFILE",
              usernameLabel: "CITIZEN ALIAS",
              usernamePlaceholder: "John Doe",
              emailLabel: "COMMUNICATION CHANNEL",
              emailPlaceholder: "name@example.com",
              passwordLabel: "ACCESS KEY",
              confirmLabel: "VERIFICATION",
              terms: "I AGREE TO THE TERMS AND CONDITIONS",
              submit: "GENERATE IDENTITY",
              submitting: "REGISTERING...",
              hasAccount: "ALREADY REGISTERED?",
              login: "Open Session",
              alreadyConnected: "You are already logged in as",
              backHome: "Back to home",
              errorDefault: "Registration error",
              usernameRequired: "Citizen alias is required",
              emailInvalid: "Invalid email",
              passwordMin: "Minimum 6 characters",
              confirmRequired: "Please confirm your password",
              passwordMismatch: "Passwords do not match"
            }
          }
        },
        pages: {
          landing: {
            festival: "International Festival",
            title: "Cinema & Artificial Intelligence",
            location: "Marseille",
            exploreFilms: "Explore Films",
            agenda: "View Agenda",
            competition: {
              label: "Official Selection",
              title: "Films in Competition",
              description: "Discover a curated selection of creative films using AI, carefully selected by our international jury.",
              viewSelection: "View Full Selection"
            },
            timeline: {
              label: "The Temporal Protocol",
              title: "Our Journey",
              preparation: "Months of preparation",
              selection: "Films selected",
              experience: "Web3 Experience",
              marseille: "In Marseille",
              join: "Join the Adventure"
            },
            conferences: {
              title: "Two Days",
              subtitle: "of Exceptional Conferences",
              item1: "Meetings with tomorrow's AI creators",
              item2: "Practical workshops and live demonstrations",
              item3: "Debates on the future of cinema and AI",
              fullAgenda: "View Full Agenda",
              projections: "Film Screenings",
              projectionsDesc: "Discover the best films from the competition in premiere.",
              workshops: "Technical Workshops",
              workshopsDesc: "Master AI creation tools with our experts.",
              awards: "Awards Ceremony",
              awardsDesc: "Celebrate the exceptional talents of the festival."
            },
            night: {
              label: "Nocturnal Innovation",
              title: "Mars.AI",
              description: "An immersive evening where art, technology, and culture converge.",
              experience: "Join us for an unforgettable experience.",
              date: "FEBRUARY 8",
              time: "20:00 - 04:00",
              book: "Book Your Spot"
            },
            numbers: {
              title: "The Numbers",
              subtitle: "of the Festival",
              scale: "Global Dimension",
              countries: "Countries represented",
              films: "Films submitted"
            },
            partners: {
              label: "Partners",
              title: "Our Strategic Partners"
            },
            footer: {
              tagline: "Where imagination meets artificial intelligence.",
              nav: "Navigation",
              gallery: "Gallery",
              program: "Program",
              top50: "Top 50",
              ticketing: "Ticketing",
              newsletter: "The Bulletin",
              email: "Your email",
              ok: "OK",
              copyright: "© 2026 MARS.AI Festival. All rights reserved.",
              design: "Design by Creative Team",
              legal: "Legal Notice"
            }
          },
          home: {
            title: "Welcome to MarsAI",
            subtitle: "The platform for musical talents"
          },
          discover: {
            title: "Explore",
            worksCount: "works",
            search: "Search for a film, a director...",
            by: "by",
            noResults: "No results",
            noResultsDesc: "No film matches your search.",
            reset: "Reset",
            categories: {
              all: "All",
              scifi: "Sci-Fi",
              digitalArt: "Digital Art",
              animation: "Animation",
              experimental: "Experimental",
              romance: "Romance",
              drama: "Drama",
              comedy: "Comedy",
              thriller: "Thriller",
              philosophical: "Philosophical"
            }
          },
          competition: {
            live: "LIVE RANKINGS • MARSAI 2026",
            title: "THE TOP 50",
            subtitle: "Discover the creations that captivate the imagination. The top 10 films will advance to the final jury selection phase.",
            general: "General Competition",
            film: "Film",
            performance: "Performance",
            applause: "applause",
            views: "views",
            by: "by"
          },
          agenda: {
            infoPratiques: "Practical Info",
            date: "JUNE 13, 2026",
            city: "MARSEILLE",
            venueName: "La Plateforme_",
            venueDesc: "The epicenter of Marseille's creative revolution. 4000m² dedicated to image and the future.",
            programTitle: "Conference Schedule",
            conferences: [
              { type: "Social", title: "Welcome & Networking Coffee" },
              { type: "Keynote", title: "Opening Conference: AI in the Service of Cinema" },
              { type: "Break", title: "Free Lunch" },
              { type: "Cinema", title: "Official Selection Screening" },
              { type: "Talk", title: "Roundtable: Desirable Futures" },
              { type: "Awards", title: "Grand Prix & Closing Ceremony" },
              { type: "Party", title: "MARS.A.I Night - Immersive DJ Set" }
            ],
            access: {
              title: "Access",
              transport: {
                title: "Public Transport",
                desc: "Tram T2 / T3 - Arenc Le Silo stop.\nMetro M2 - Désirée Clary station."
              },
              car: {
                title: "By Car",
                desc: "Highway A55 - Exit 2.\nIndigo Quai du Lazaret parking 200m away."
              },
              address: {
                title: "Address",
                desc: "12 Rue d'Uzes, 13002 Marseille (Main Entrance)."
              },
              mapAlt: "Access map"
            },
            workshopsSection: {
              sectionTitle: "Practical Workshops",
              title: "Workshops",
              subtitle: "Creative AI",
              desc: "From theory to practice with the best international experts. Note: limited spots (max 15 per session).",
              coach: "Coach",
              availability: "Availability",
              reserve: "Reserve my spot",
              items: [
                { title: "Video Generation: The Basics", capacity: "10 spots left" },
                { title: "AI & Screenplay: Co-writing", capacity: "8 spots left" },
                { title: "AI Post-prod & Special Effects", capacity: "12 spots left" },
                { title: "Ethics & AI Law", capacity: "5 spots left" }
              ]
            }
          },
          profile: {
            follow: "Follow",
            biography: "Biography",
            bio: "\"Every image I create is an open window to a world that doesn't exist yet. AI is my brush, imagination is my canvas.\"",
            location: "China",
            since: "Since January 2024",
            audience: "Audience",
            subscribers: "subscribers",
            subscriptions: "subscriptions",
            stats: {
              films: "Films published",
              applause: "Applause",
              views: "Total views"
            },
            tabs: {
              portfolio: "Portfolio",
              favorites: "Favorites",
              bio: "Bio"
            },
            views: "views",
            noSubmissions: "No submissions yet."
          },
          detail: {
            notFound: "Film not found",
            backToDiscover: "Back to discover",
            close: "Close",
            marsaiTop: "MARS.AI TOP 50",
            directorManifesto: "Director's Manifesto",
            aiStack: "AI Stack",
            engine: "Engine",
            discussion: "Discussion",
            opinions: "opinions",
            writeCritique: "Write a review...",
            impactMetrics: "Impact Metrics",
            uniqueViews: "Unique views",
            applause: "Applause",
            shares: "Shares",
            technicalSheet: "Technical Sheet",
            country: "Country",
            ratio: "Aspect Ratio",
            premiere: "Premiere"
          },
          soumission: {
            title: "Submission",
            description: "Welcome to the submission page."
          }
        }
      }
    }
  },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
});

export default i18n;
