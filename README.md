# [Mindfire | FOSS](https://mindfiredigital.github.io/)

Welcome to the open source community website for Mindfire.This platform serves as a hub for our community, offering resources, discussions, and opportunities for collaboration. We encourage contributions and engagement from everyone interested in our mission.

## Purpose

The purpose of FOSS is to provide a collaborative platform for developers, enthusiasts, and contributors to engage with Mindfire's projects, share knowledge, and foster a vibrant community. Through this platform, we aim to:

- **Encourage Collaboration:** Facilitate collaboration among developers and contributors to work on open source projects, fostering an environment of learning and sharing.
- **Share Resources:** Provide a centralized space for accessing resources, including documentation, guidelines, and tools related to Mindfire's open source projects.
- **Support Innovation:** Promote innovation by allowing community members to suggest, discuss, and implement new features, enhancements, or fixes for Mindfire's projects.

## Technology Stack

- [**Next.js**](https://nextjs.org/docs)
- [**React**](https://react.dev/learn)
- [**GitHub Pages**](https://pages.github.com/)

## Local Setup

To set up the project locally for development and testing:

### Prerequisites

- Node.js (with npm or Yarn) [**Version 18.17.0 or later**](https://nodejs.org/en)
- Git

### Installation

- Clone the repository:
  - **Using Https**

    ```
    git clone https://github.com/mindfiredigital/mindfiredigital.github.io.git
    ```

  - **Using SSH** [Github's SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh)
    ```
    git clone git@github.com:mindfiredigital/mindfiredigital.github.io.git
    ```
- Navigate to the project directory:
  ```
  cd your-project-directory
  ```
- Install dependencies:
  ```
  npm install   # or using Yarn: yarn install
  ```
- Start the development server:
  ```
  npm run dev   # or using Yarn: yarn dev
  ```

## How to contribute

For detailed instructions on how to contribute, please refer to the [Contribution Guide](https://gitlab.mindfire.co.in/mindfire-foss/open-source-guidelines/-/blob/main/contribution-guidelines/making-changes.md) file.

## Deployment Steps

- Generate build files by running:
  ```
  npm run build # or using Yarn: yarn build
  ```
- This command will create the necessary build files inside the `docs` directory.
- Ensure that the `docs` directory contains the latest build after running the build command.
- Create a new branch or use an existing branch dedicated to deployment, example:
  ```
  git checkout -b deployment-branch
  ```
- Add the updated build files:
  ```
  git add docs
  ```
- Commit the changes. [Commit message's convetions](https://gitlab.mindfire.co.in/mindfire-foss/open-source-guidelines/-/blob/main/contribution-guidelines/commit-messages.md)
- Push the changes to the remote repository.
- Create a pull request to merge the changes from the `deployment-branch` into the main or master branch. [Pull request conventions](https://gitlab.mindfire.co.in/mindfire-foss/open-source-guidelines/-/blob/main/contribution-guidelines/pull-requests.md)
