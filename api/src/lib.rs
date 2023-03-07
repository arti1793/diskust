use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::{
    ffi::OsStr,
    fs::{metadata, read_dir},
    io::{self, Read, Result},
    path::Path,
};
use sysinfo::{DiskExt, DiskType, System, SystemExt};

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Node {
    is_file: bool,
    is_dir: bool,
    size: u64,
    files_count: u64,
    whole_path_str: String,
    name: String,
    nodes: Box<Option<Vec<Node>>>,
}

impl Node {
    pub fn new(path: &Path) -> Result<Node> {
        let meta = metadata(path);
        if let Result::Ok(meta) = meta {
            if path.is_symlink() {
                return Result::Err(io::Error::new(
                    io::ErrorKind::NotFound,
                    format!(
                        "skip symlink {}",
                        path.file_name()
                            .unwrap_or(OsStr::new(""))
                            .to_str()
                            .unwrap_or("")
                            .to_string()
                    ),
                ));
            }
            if path
                .file_name()
                .unwrap_or(OsStr::new("/"))
                .to_str()
                // .into_string()
                .unwrap_or(" ")
                .starts_with(".")
                || path
                    .file_name()
                    .unwrap_or(OsStr::new("/"))
                    .to_str()
                    // .into_string()
                    .unwrap_or(" ")
                    == "proc"
            // ???????????????????????????????
            {
                return Result::Err(io::Error::new(
                    io::ErrorKind::NotFound,
                    format!(
                        "skip hidden {}",
                        path.file_name()
                            .unwrap_or(OsStr::new(""))
                            .to_str()
                            .unwrap_or("")
                            .to_string()
                    ),
                ));
            }
            if path.is_file() {
                return Ok(Node {
                    is_dir: path.is_dir(),
                    is_file: path.is_file(),
                    nodes: Box::new(None),
                    size: meta.len(),
                    files_count: 1,
                    whole_path_str: path.display().to_string(),
                    name: path
                        .file_name()
                        .unwrap_or(OsStr::new(""))
                        .to_str()
                        .unwrap_or("")
                        .to_string(),
                });
            }
            if path.is_dir() {
                let mut nodes: Vec<Node> = read_dir(path)?
                    .par_bridge()
                    .into_par_iter()
                    .flat_map(|entry| -> Option<Node> {
                        match entry {
                            Result::Ok(entry) => {
                                let node = Self::new(&entry.path());
                                return match node {
                                    Result::Ok(node) => Some(node),
                                    Result::Err(err) => {
                                        println!("{}", err.to_string());
                                        return None;
                                    }
                                };
                            }
                            Result::Err(err) => {
                                println!("{}", err.to_string());
                                return None;
                            }
                        }
                    })
                    .collect();
                nodes.sort_by(|one, two| two.size.cmp(&one.size));
                let size = nodes.iter().map(|Node { size, .. }| size).sum();
                let files_count = nodes
                    .iter()
                    .map(|Node { files_count, .. }| files_count)
                    .sum();
                let dir_node = Ok(Self {
                    is_dir: path.is_dir(),
                    is_file: path.is_file(),
                    nodes: Box::new(Some(nodes)),
                    size,
                    name: path
                        .file_name()
                        .unwrap_or(OsStr::new(""))
                        .to_str()
                        .unwrap_or("")
                        .to_string(),
                    files_count,
                    whole_path_str: path.display().to_string(),
                });

                return dir_node;
            }

            return Result::Err(io::Error::new(
                io::ErrorKind::NotFound,
                "not a dir, not a file , not a symlink",
            ));
        } else {
            return Result::Err(meta.err().unwrap());
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiskInfo {
    name: String,
    path: String,
    total: u64,
    free_space: u64,
    filled: u64,
    is_removable: bool,
    file_system: String,
    type_: String,
    // root: Option<Node>,
}
pub struct Diskust {
    pub system: System,
    pub disks: Vec<DiskInfo>,
}

impl<'a> Diskust {
    pub fn new() -> Self {
        let mut system = System::new_all();

        // First we update all information of our `System` struct.
        system.refresh_all();

        // We display all disks' information:
        // let mut disks: HashMap<DiskInfo, Option<Node>> = HashMap::new();
        let mut disks = Vec::new();
        for disk in system.disks() {
            let mut fs = String::new();
            disk.file_system().read_to_string(&mut fs).unwrap();
            disks.push(DiskInfo {
                file_system: fs,
                type_: match disk.type_() {
                    DiskType::HDD => String::from("HDD"),
                    DiskType::SSD => String::from("SSD"),
                    DiskType::Unknown(_) => format!("unknown"),
                },
                is_removable: disk.is_removable(),
                free_space: disk.available_space(),
                name: disk.name().to_string_lossy().to_string(),
                path: disk.mount_point().display().to_string(),
                total: disk.total_space(),
                filled: disk.total_space() - disk.available_space(), // root: None,
            });
        }
        Diskust { system, disks }
    }

    // fn load_disk(mut self, name: &str) -> Result<Self> {
    //     // let path = disk.path.clone();
    //     let disk = self
    //         .disks
    //         .iter_mut()
    //         .find(|disk_info| disk_info.name == name);
    //     if let Some(disk) = disk {
    //         disk.root = Some(Node::new(Path::new(&disk.path))?);
    //         return Result::Ok(self);
    //     } else {
    //         return Result::Err(io::Error::new(
    //             io::ErrorKind::NotFound,
    //             "not found disk with name",
    //         ));
    //     }
    // }
}

#[cfg(test)]
mod tests {
    use std::io::ErrorKind;

    use super::*;

    #[test]
    fn empty() {
        assert_eq!(
            Node::new(Path::new(&"./no_such_directory".to_string()))
                .err()
                .unwrap()
                .kind(),
            ErrorKind::NotFound
        );
    }
    #[test]
    fn file() {
        let mut file = Node::new(Path::new(&"./../Cargo.toml".to_string())).unwrap();
        file.size = 0; // for test
        file.files_count = 0;
        assert_eq!(
            file,
            Node {
                is_dir: false,
                is_file: true,
                nodes: Box::new(None),
                size: 0,
                files_count: 0,
                whole_path_str: "./../Cargo.toml".to_string(),
                name: "Cargo.toml".to_string()
            }
        );
    }
    #[test]
    fn disks() {
        // Diskust::new();
        assert_eq!(Diskust::new().disks.len() == 0, false)
    }
    // #[test]
    // fn load_disk_error() {
    //     assert_eq!(Diskust::new().load_disk("errorishname").is_err(), true)
    // }
}
