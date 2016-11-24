## Ansible

Crear las carpetas "Provision" y "project" en la carpeta principal. Instalar Ansible.

Para configurar Ansible, en la carpeta "/etc/ansible" hay que modificar "ansible.cfg" para que "sudo\_user" sea el usuario root del sistema (por defecto "root", pero en estas máquinas se llama "ubuntu"). Crear una carpeta "group\_vars" (si no existe) y pegar en ella el archivo "app.yml" que se encuentra en este repositorio.

De vuelta a la carpeta Provision, pegar el archivo Playbook.yml de este repositorio. Por último, usar el comando "ansible-playbook Playbook.yml" para ejecutar Ansible. Esto da un output como este:

![Ejecución ansible-playbook Playbook.yml](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/Ansible.png)
