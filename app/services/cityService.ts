// app/services/cityService.ts

export async function deleteCity(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch("/api/cities/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete city");
    }
    const data = await response.json();
    return { success: data.success ?? true, message: data.message };
  } catch (error: any) {
    return { success: false, message: error.message || "Unknown error" };
  }
}