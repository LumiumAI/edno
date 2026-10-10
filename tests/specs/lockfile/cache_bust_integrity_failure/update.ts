// make the path in the edno_dir differ from the remote server
// and what's stored in the lockfile
const filePath =
  "./edno_dir/remote/http/localhost_port_4545/3011c891e5bd4172aa2e157e4c688ab6f31e91da9719704a9a54aa63faa99c88";
const text = Edno.readTextFileSync(filePath);
Edno.writeTextFileSync(filePath, "//\n" + text);
