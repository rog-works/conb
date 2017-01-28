Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  # config.vm.box_url = "../bin/xenial-server-cloudimg-amd64-vagrant.box"
  config.vm.box_url = "ubuntu/trusty64"
  config.vm.network "forwarded_port", host: 8080, guest: 8080
  config.vm.network "forwarded_port", host: 1880, guest: 1880
  config.vm.network "forwarded_port", host: 13306, guest: 13306
  config.vm.network "private_network", ip: "192.168.33.10"
  config.vm.synced_folder "./app", "/home/vagrant/sync", disabled: true
  config.vm.synced_folder ".", "/vagrant", mount_options: ['dmode=777','fmode=744']
  config.vm.provider "virtualbox" do |vb|
    vb.cpus = 2
    vb.memory = 2048
  end
  config.vm.provision "shell", path: "./provision/base.sh"
end