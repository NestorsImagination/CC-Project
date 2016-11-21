package 'emacs'
package 'npm'
package 'nodejs'
package 'git'
package 'nginx'
package 'curl'

directory '/home/ubuntu/project'

git "/home/ubuntu/project" do
  repository "https://github.com/NestorsImagination/Sample-Multiplayer-Shooter/"
  reference "master"
  action :sync
end
