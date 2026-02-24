---
name: gcloud-compute
description: "Automates Google Cloud Compute Engine instance management including setup, instance creation, and SSH connection. Use this skill when the user needs to: (1) Install or configure the gcloud CLI, (2) Create new VM instances, or (3) Connect to existing instances via SSH."
---

# GCloud Compute

This skill provides a consolidated guide for managing Google Cloud Compute Engine instances directly using the `gcloud` CLI.

## 1. Setup Guide

If `gcloud` is not yet installed or configured, follow these steps:

### Installation
- **Debian/Ubuntu:**
  ```bash
  # Add Package Source
  sudo apt-get install -y apt-transport-https ca-certificates gnupg curl
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list

  # Install
  sudo apt-get update && sudo apt-get install -y google-cloud-cli
  ```
- **Other Linux Distributions:**
  ```bash
  curl https://sdk.cloud.google.com | bash
  exec -l $SHELL
  ```
- **macOS:**
  ```bash
  brew install --cask google-cloud-sdk
  ```

### Initialization & Authentication
1. **Initialize gcloud**:
   ```bash
   gcloud init
   ```
2. **Web-free Login**: If you are in a remote environment or prefer no browser, run:
   ```bash
   gcloud auth login --no-launch-browser
   ```
   - Copy the provided URL into your local browser.
   - Authorize access and copy the verification code.
   - Paste the code back into your terminal.

## 2. Project Management

After logging in, you must select or create a Google Cloud Project.

### A. List Existing Projects
Check if you already have a project to use:
```bash
gcloud projects list
```

### B. Create a New Project
If you don't have a project, or want a new one for this VM, follow these steps:
1. **Create the project**:
   ```bash
   gcloud projects create [PROJECT_ID] --name="[PROJECT_NAME]"
   ```
   *Note: [PROJECT_ID] must be unique across all of Google Cloud.*
2. **Set as active**:
   ```bash
   gcloud config set project [PROJECT_ID]
   ```
3. **Enable Compute Engine API**:
   ```bash
   gcloud services enable compute.googleapis.com
   ```
   *Note: This requires billing to be enabled for the project.*

---

## 3. VM Management Workflow

Follow this workflow to create and connect to a VM.

### Step A: Evaluate Machine Type and Cost
Before creating an instance, check the available machine types and their specifications to estimate costs.

1. **List Machine Types**: Display available machine types and their core/memory specs in your zone.
   ```bash
   gcloud compute machine-types list --zones=[ZONE]
   ```
   *Note: Costs vary by machine type. For example, `e2-micro` is generally the cheapest, while `e2-standard-4` provides more resources at a higher price.*

2. **Estimate Cost**: Use the [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) for precise estimates based on your selected machine type and region.

### Step B: Create an Instance
**Mandatory**: You must provide a unique name for your instance.

```bash
gcloud compute instances create [MANDATORY_INSTANCE_NAME] \
    --zone=[ZONE] \
    --machine-type=[MACHINE_TYPE] \
    --image-family=debian-12 \
    --image-project=debian-cloud
```
*Tip: Common zones include `us-central1-a`, `asia-northeast3-a` (Seoul). Recommended machine types: `e2-micro` (development), `e2-small` (standard).*

### Step C: Connect via SSH
Once the instance is running, connect using:
```bash
gcloud compute ssh [INSTANCE_NAME] --zone=[ZONE]
```

---

## 4. Quick Reference

| Action | Command |
| :--- | :--- |
| **List Instances** | `gcloud compute instances list` |
| **Stop Instance** | `gcloud compute instances stop [NAME]` |
| **Start Instance** | `gcloud compute instances start [NAME]` |
| **Delete Instance** | `gcloud compute instances delete [NAME]` |
| **Check Config** | `gcloud config list` |

## Tips for Efficiency
- **Preemptible VMs:** Add `--preemptible` to the create command to save up to 80% on costs for short-lived tasks.
- **Static External IP:** If you need a constant IP, use `--address=[IP_NAME]`.
