"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useUserManagementModal } from "../../hooks/use-userManagementModal";


const formSchema = z.object({
  username: z.string().min(1, { message: "Username/Email is required." }),
  roleId: z.string().min(1, { message: "Please select a role." }),
});

type UserManagementFormValues = z.infer<typeof formSchema>;

export const UserManagementModal = () => {
  const { isOpen, onClose, initialData, roles } = useUserManagementModal();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;
  const title = isEditMode ? "Update User Role" : "Assign User";
  const description = isEditMode
    ? "Change the role for this user."
    : "Assign an existing user to this business unit by their username/email.";
  const action = isEditMode ? "Save changes" : "Assign";

  const form = useForm<UserManagementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      roleId: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        username: initialData.username || "",
        roleId: initialData.roleId,
      });
    } else {
      form.reset({ username: "", roleId: "" });
    }
  }, [initialData, form]);

  const onSubmit = async (data: UserManagementFormValues) => {
    try {
      setLoading(true);
      if (isEditMode && initialData) {
        await axios.patch(
          `/api/${params.businessUnitId}/user-management/${initialData.userId}`,
          data
        );
      } else {
        await axios.post(
          `/api/${params.businessUnitId}/user-management`,
          data
        );
      }
      router.refresh();
      toast.success(isEditMode ? "User role updated." : "User assigned successfully.");
      onClose();
    } catch (error) {
      toast.error(`Something went wrong. ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username (Email)"
            variant="outlined"
            fullWidth
            disabled={loading || isEditMode}
            placeholder="user@example.com"
            {...form.register("username")}
            error={!!form.formState.errors.username}
            helperText={form.formState.errors.username?.message}
          />
          <FormControl fullWidth variant="outlined" error={!!form.formState.errors.roleId}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              disabled={loading}
              {...form.register("roleId")}
              value={form.watch("roleId")}
            >
              <MenuItem value="" disabled>
                Select a role
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {form.formState.errors.roleId?.message}
            </Typography>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pt: 1, pr: 3, pb: 3 }}>
        <Button disabled={loading} variant="outlined" onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button disabled={loading} variant="contained" onClick={form.handleSubmit(onSubmit)} type="submit">
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  );
};