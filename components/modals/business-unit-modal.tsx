"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useBusinessUnitModal } from "../../hooks/use-bu-modal";
 // Assuming this hook still exists

const formSchema = z.object({
  name: z.string().min(1, { message: "Store name is required." }),
});

export const BusinessUnitModal = () => {
  const storeModal = useBusinessUnitModal();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/stores", values);
      window.location.assign(`/${response.data.id}`);
    } catch (error) {
      toast.error(`Something went wrong: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={storeModal.isOpen} onClose={storeModal.onClose}>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Create Business Unit
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Add a new business unit to manage properties and operations.
        </Typography>
        <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            disabled={loading}
            placeholder="Tropicana Resort"
            {...form.register("name")}
            error={!!form.formState.errors.name}
            helperText={form.formState.errors.name?.message}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          disabled={loading}
          variant="outlined"
          onClick={storeModal.onClose}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="contained"
          onClick={form.handleSubmit(onSubmit)}
          sx={{ ml: 1 }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};