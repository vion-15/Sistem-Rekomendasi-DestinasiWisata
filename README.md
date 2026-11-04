# Tourist Destination Recommendation System

A web-based travel recommendation platform that helps users discover tourism destinations based on their interests and preferences using Content-Based Filtering and Sentence-BERT.

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=flat-square)
![Project Type](https://img.shields.io/badge/Project-Full--Stack-blue?style=flat-square)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Content--Based%20Filtering-orange?style=flat-square)
![GIS](https://img.shields.io/badge/GIS-Geographic%20Information%20System-2E8B57?style=flat-square)

**Built with:** Next.js · Go · FastAPI · PostgreSQL · Sentence Transformers · OpenStreetMap

---

## Application Preview

Explore the main interfaces of the Tourist Destination Recommendation System.

<table>
  <tr>
    <td width="50%">
      <img src="docs/images/landingpage.png" alt="Homepage" width="100%">
      <p align="center"><strong>Landing Page</strong></p>
    </td>
    <td width="50%">
      <img src="docs/images/dashboardwisatawan.png" alt="Destination Listing" width="100%">
      <p align="center"><strong>Tourist Dashboard</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/images/listdestination.png" alt="Destination Detail" width="100%">
      <p align="center"><strong>Destination List</strong></p>
    </td>
    <td width="50%">
      <img src="docs/images/result.png" alt="Recommendation Page" width="100%">
      <p align="center"><strong>Recommendation Page</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/images/gis.png" alt="Destination Detail" width="100%">
      <p align="center"><strong>GIS Page</strong></p>
    </td>
    <td width="50%">
      <img src="docs/images/dashboardadmin.png" alt="Recommendation Page" width="100%">
      <p align="center"><strong>Admin Dashboard Page</strong></p>
    </td>
  </tr>
</table>

## About The Project

**Tourist Destination Recommendation System** is a web-based travel recommendation platform designed to help users discover tourism destinations based on their interests and preferences.

The application integrates Machine Learning and Geographic Information System (GIS) technologies to provide relevant destination recommendations while presenting geographical information through an interactive map.

### Project Objectives

- Help users discover tourism destinations that match their interests.
- Provide personalized recommendations using Content-Based Filtering.
- Utilize Sentence-BERT to represent textual information for the recommendation process.
- Present destination locations through an interactive map.

### Problem Statement

Finding suitable tourism destinations can be challenging when users have limited information or are unsure where to visit. This application aims to simplify the discovery process by providing recommendations based on destination characteristics and user preferences.

## Key Features

### User Features

- **Personalized Destination Recommendations** — Discover tourism destinations based on user preferences using a Content-Based Filtering approach.
- **Destination Exploration** — Browse available tourism destinations and explore their detailed information.
- **Interactive Map** — View geographical locations of tourism destinations through an interactive map.
- **Destination Details** — Access destination information to help users make informed travel decisions.
- **User Authentication** — Register and log in to access application features.
- **Review & Rate** — Send some review and rate for the place, this data will be use for evaluate the destination.

### Admin Features

- **Dashboard Analytics** — Monitor tourism destination data through a centralized dashboard.
- **Destination Management** — Manage tourism destination information within the application.
- **Data Visualization** — View statistical information through charts and visual representations.
- **User data management** — Manage Tourist Account within the application.
- **Review & Rate Report** — Download review and rate data a destination.
- **Statistical Report** — Download statistical report such "how many user visiting a destination etc.".

## Technology Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white)

### Backend
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-008ECF?style=flat-square&logo=gin&logoColor=white)
![GORM](https://img.shields.io/badge/GORM-00ADD8?style=flat-square&logo=go&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-6A5ACD?style=flat-square)

### Machine Learning & Recommendation Service
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Sentence Transformers](https://img.shields.io/badge/Sentence_Transformers-FFD21E?style=flat-square&logo=huggingface&logoColor=black)
![Content-Based Filtering](https://img.shields.io/badge/Content--Based_Filtering-FF9800?style=flat-square)
![Cosine Similarity](https://img.shields.io/badge/Cosine_Similarity-673AB7?style=flat-square)

### Database & Infrastructure
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

### Third-Party Services & Libraries
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square)
![Gmail SMTP](https://img.shields.io/badge/Gmail_SMTP-EA4335?style=flat-square&logo=gmail&logoColor=white)

## Installation & Setup

Follow the instructions below to run the project locally.

### Prerequisites

Make sure you have installed the following tools:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone Repository

```bash
git clone https://github.com/vion-15/Sistem-Rekomendasi-DestinasiWisata.git

cd Sistem-Rekomendasi-DestinasiWisata
```

### 2. Environment Configuration

Create the required environment files based on the provided `.env.example` files.

```bash
cp .env.example .env
```

Update the environment variables according to your local configuration.

**Note:** Make sure all required environment variables are properly configured before starting the application.

### 3. Run Application

Build and start all application services using Docker Compose:

```bash
docker compose up --build -d
```

Check the running containers:

```bash
docker compose ps
```

### 4. Stop Application

To stop all running services:

```bash
docker compose down
```

### Additional Notes

- Make sure Docker Desktop is running before executing Docker Compose commands.
- Configure the required environment variables before starting the application.
- Application access URLs and ports depend on the Docker Compose configuration.

## Author

**Developed by [Ahmad](https://github.com/vion-15)**

Computer Science Graduate | Junior Software Developer

- GitHub: [@vion-15](https://github.com/vion-15)