import os
import shutil

def get_backup_type():
    backuptype = input("What kind of backup should be run? \nChoices are 'docs', 'sheets', 'ap' or 'all' \n")
    assert backuptype in ['docs', 'sheets', 'ap', 'all'], "Please enter a valid backuptype, 1-4"
    return backuptype

def get_input():
    subfolders = [ f.path for f in os.scandir('backups') if f.is_dir() ]

    print("Availalble backup times are:\n")
    for folder in subfolders:
        this_folder = folder.replace("backups/", "")
        print(this_folder + "\n")
    name = input('Enter a timestamp to restore from\n')
    return name


def restore_sheets(source_folder):
    print("restoring sheets")
    file_list = ['ballot_measures.sheet.json', 'calls.sheet.json', 'candidates.sheet.json', 'census_data.csv', 'county_names.csv', 'flags.sheet.json', 'footer.sheet.json', 'governors.sheet.json', 'house.sheet.json', 'inactive_senate_races.sheet.json', 'rosters.sheet.json', 'senate.sheet.json', 'states.sheet.json', 'strings.sheet.json']
    for filename in file_list:
        src = source_folder + "/" + filename

        shutil.copy2(src, '../data/') 
    print("... done\n")


def restore_docs(source_folder):
    print("restoring docs")
    file_list = ['longform.docs.txt',]
    for filename in file_list:
        src = source_folder + "/" + filename

        shutil.copy2(src, '../data/') 
    print("... done\n")


def restore_ap(source_folder):
    print("restoring ap")

    source_folder = source_folder + "/build"
    dest_folder = '../build/data'
    
    try:
        shutil.rmtree(dest_folder)
    except FileNotFoundError:
        pass
    # Copy the content of 
    # source to destination 
    destination = shutil.copytree(source_folder, dest_folder) 
    print("...done\n")


def backup():

    backupfolder = get_input()
    backupsrc = "backups/" + backupfolder 
    assert os.path.exists(backupsrc), "No backup with that timestamp exists"


    backuptype = get_backup_type()

    if backuptype in ['sheets', 'all']:
        restore_sheets(backupsrc)

    if backuptype in ['docs', 'all']:
        restore_docs(backupsrc)


    if backuptype in ['ap', 'all']:
        restore_ap(backupsrc)



if __name__ == '__main__':

    backup()