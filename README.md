# Microservice App - PRFT Devops Training

This is the application you are going to use through the whole traninig. This, hopefully, will teach you the fundamentals you need in a real project. You will find a basic TODO application designed with a [microservice architecture](https://microservices.io). Although is a TODO application, it is interesting because the microservices that compose it are written in different programming language or frameworks (Go, Python, Vue, Java, and NodeJS). With this design you will experiment with multiple build tools and environments. 

## Components
In each folder you can find a more in-depth explanation of each component:

1. [Users API](/users-api) is a Spring Boot application. Provides user profiles. At the moment, does not provide full CRUD, just getting a single user and all users.
2. [Auth API](/auth-api) is a Go application, and provides authorization functionality. Generates [JWT](https://jwt.io/) tokens to be used with other APIs.
3. [TODOs API](/todos-api) is a NodeJS application, provides CRUD functionality over user's TODO records. Also, it logs "create" and "delete" operations to [Redis](https://redis.io/) queue.
4. [Log Message Processor](/log-message-processor) is a queue processor written in Python. Its purpose is to read messages from a Redis queue and print them to standard output.
5. [Frontend](/frontend) Vue application, provides UI.

## Architecture

Take a look at the components diagram that describes them and their interactions.
![microservice-app-example](/arch-img/Microservices.png)


## Overview

Este repositorio contiene una aplicación TODO implementada en arquitectura de microservicios y desplegada en Azure. Incluye:

- **Microservicios** escritos en distintos lenguajes y frameworks: Spring Boot (Users API), Go (Auth API), Node.js (TODOs API), Python (Log Processor) y Vue.js (Frontend).  
- **Infraestructura como código** en Terraform para provisionar recursos en Azure: Resource Group, ACR, AKS, Redis Cache, API Management y namespace de Kubernetes. ([github.com](https://github.com/CrisDelCast/microservice-app-example/blob/infra/feature/automation/Terraform/main.tf))
- **Pipelines de GitHub Actions** para automatizar el aprovisionamiento de la infraestructura y el despliegue continuo en AKS. ([github.com](https://github.com/CrisDelCast/microservice-app-example/blob/infra/feature/automation/.github/workflows/infraestructure.yml))

## Components

| Servicio                  | Tecnología          | Descripción                                  |
| ------------------------- | ------------------- | -------------------------------------------- |
| **Users API**             | Spring Boot         | Expone perfiles de usuario (CRUD lectura).   |
| **Auth API**              | Go                  | Genera y valida tokens JWT.                 |
| **TODOs API**             | Node.js             | CRUD de tareas con encolado en Redis.       |
| **Log Message Processor** | Python              | Procesa mensajes de Redis y los persiste.   |
| **Frontend**              | Vue.js              | Interfaz de usuario para gestionar TODOs.   |

## Branching Strategy

Adoptamos **Trunk-Based Development**, donde todos los desarrolladores integran cambios pequeños y frecuentes directamente en la rama principal (“trunk”), evitando ramas largas y conflictos de merge ([atlassian.com](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development?utm_source=chatgpt.com), [circleci.com](https://circleci.com/blog/trunk-vs-feature-based-dev/?utm_source=chatgpt.com)). Esto facilita la integración continua (CI) y la entrega continua (CD) al mantener siempre el código en un estado desplegable citeturn2search4turn2search6.

## Infrastructure

La carpeta `Terraform/` contiene la definición de la infraestructura en Azure:

- **Resource Group** (`azurerm_resource_group.microservices_rg`)  
- **Azure Container Registry** (`azurerm_container_registry.acr`)  
- **Azure Kubernetes Service** (`azurerm_kubernetes_cluster.aks_cluster`)  
- **Redis Cache** para colas (`azurerm_redis_cache.redis_queue`)  
- **API Management** (`azurerm_api_management.apim`)  
- **Kubernetes Namespace** (`kubernetes_namespace.microservices_ns`)  

```hcl
provider "azurerm" { ... }
provider "kubernetes" { ... }
# Resource Group
resource "azurerm_resource_group" "microservices_rg" { ... }
# ACR, AKS, Redis, APIM, Namespace...
```  
(Código completo: `Terraform/main.tf`) ([github.com](https://github.com/CrisDelCast/microservice-app-example/blob/infra/feature/automation/Terraform/main.tf))

## Design Patterns

- **Cache-Aside**: Redis funciona como buffer de mensajes entre servicios.  
- **API Gateway**: APIM unifica rutas, control de versiones y seguridad.  
- **Health Probes**: Cada servicio expone `livenessProbe` y `readinessProbe` para Kubernetes.

## Continuous Integration & Deployment

Se implementan dos workflows de GitHub Actions:

1. **Infraestructura** (`.github/workflows/infraestructure.yml`): aprovisiona y actualiza recursos Azure con Terraform. ([github.com](https://github.com/CrisDelCast/microservice-app-example/blob/infra/feature/automation/.github/workflows/infraestructure.yml))
2. **Despliegue en AKS** (`.github/workflows/deploy-aks.yml`): construye imágenes Docker, las publica en ACR, aplica manifiestos Kubernetes y reinicia deployments.

Cada pipeline se dispara en `push` hacia `master` o `infra/dev`, garantizando que la infraestructura y las aplicaciones se mantengan sincronizadas y reproducibles.

## Getting Started

1. **Clonar el repositorio**:  
   ```bash
   git clone -b infra/feature/automation https://github.com/CrisDelCast/microservice-app-example.git
   ```
2. **Configurar secretos en GitHub**:  
   - `AZURE_CREDENTIALS` (Service Principal JSON).  
   - `AZURE_RESOURCE_GROUP`, `AKS_CLUSTER_NAME`, `AZURE_CONTAINER_REGISTRY`, `AZURE_REDIS_NAME`.  
3. **Adjust Terraform variables** (`Terraform/variables.tf`).  
4. **Ejecutar workflows** desde GitHub Actions o localmente:
   ```bash
   cd Terraform && terraform init && terraform apply -auto-approve
   ```
5. **Desplegar microservicios**: el pipeline de despliegue se encargará de la construcción, push y aplicación en AKS.

## Contributing

- Trabaja en la rama principal (`main`/`master`).  
- Crea ramas cortas para experimentos y mergea frecuentemente con `trunk`.  
- Abre Pull Requests para revisión de código y aprobación de tests.

## License

Este proyecto está bajo la licencia MIT.  

---

© 2025 CrisDelCast

